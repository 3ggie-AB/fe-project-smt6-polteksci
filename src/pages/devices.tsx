import { useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useListDevices, useCreateDevice, useDeleteDevice, getListDevicesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Monitor, Plus, Search, Trash2, Activity, Server, Router as RouterIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const deviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  ip_address: z.string().min(7, "Valid IP required"),
  type: z.string().min(1, "Type is required"),
  location: z.string().optional(),
});

export default function Devices() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: devicesData, isLoading } = useListDevices(
    { 
      search: search || undefined, 
      type: typeFilter !== "all" ? typeFilter : undefined,
      limit: 100 
    },
    { query: { queryKey: getListDevicesQueryKey({ search: search || undefined, type: typeFilter !== "all" ? typeFilter : undefined, limit: 100 }) } }
  );

  const createMutation = useCreateDevice();
  const deleteMutation = useDeleteDevice();

  const form = useForm<z.infer<typeof deviceSchema>>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: "",
      ip_address: "",
      type: "server",
      location: "",
    },
  });

  const onSubmit = (values: z.infer<typeof deviceSchema>) => {
    createMutation.mutate({ data: { ...values, is_active: true } }, {
      onSuccess: () => {
        toast({ title: "Device added successfully" });
        setIsCreateOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListDevicesQueryKey() });
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Failed to add device", description: err.message });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this device?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Device deleted" });
          queryClient.invalidateQueries({ queryKey: getListDevicesQueryKey() });
        }
      });
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'server': return <Server className="h-4 w-4 text-primary" />;
      case 'router': return <RouterIcon className="h-4 w-4 text-blue-500" />;
      case 'switch': return <Activity className="h-4 w-4 text-green-500" />;
      default: return <Monitor className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search devices by name or IP..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="server">Server</SelectItem>
              <SelectItem value="router">Router</SelectItem>
              <SelectItem value="switch">Switch</SelectItem>
              <SelectItem value="workstation">Workstation</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hostname / Alias *</FormLabel>
                      <FormControl><Input placeholder="web-prod-01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ip_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP Address *</FormLabel>
                      <FormControl><Input placeholder="192.168.1.100" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="server">Server</SelectItem>
                          <SelectItem value="router">Router</SelectItem>
                          <SelectItem value="switch">Switch</SelectItem>
                          <SelectItem value="workstation">Workstation</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl><Input placeholder="Data Center 1, Rack A4" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Adding..." : "Add Device"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : devicesData?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No devices found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              devicesData?.data?.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div className={`w-2.5 h-2.5 rounded-full ${device.status === 'online' ? 'bg-green-500' : device.status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'}`} title={device.status || 'unknown'} />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/devices/${device.id}`} className="hover:underline flex items-center gap-2">
                      {getDeviceIcon(device.type)}
                      {device.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{device.ip_address}</TableCell>
                  <TableCell className="capitalize">{device.type}</TableCell>
                  <TableCell className="text-muted-foreground">{device.location || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(device.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}