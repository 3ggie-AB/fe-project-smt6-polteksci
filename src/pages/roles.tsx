import { useListRoles, useListPermissions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Key } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Roles() {
  const { data: rolesData, isLoading: rolesLoading } = useListRoles();
  const { data: permissionsData, isLoading: permissionsLoading } = useListPermissions();

  const roles = rolesData?.data || [];
  const permissions = permissionsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Roles
          </h2>
          
          {rolesLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
          ) : roles.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No roles defined in the system.
              </CardContent>
            </Card>
          ) : (
            roles.map(role => (
              <Card key={role.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg capitalize flex justify-between items-center">
                    {role.name}
                    <Badge variant="secondary">ID: {role.id}</Badge>
                  </CardTitle>
                  {role.description && <CardDescription>{role.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium mb-2 text-muted-foreground">Assigned Permissions:</div>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions && role.permissions.length > 0 ? (
                      role.permissions.map(p => (
                        <Badge key={p.id} variant="outline" className="bg-primary/5">
                          {p.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No permissions assigned</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Key className="h-5 w-5 text-amber-500" /> Available Permissions
          </h2>
          
          <Card>
            <CardContent className="p-0">
              {permissionsLoading ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : permissions.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No permissions defined.
                </div>
              ) : (
                <div className="divide-y">
                  {permissions.map(p => (
                    <div key={p.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="font-mono text-sm font-medium">{p.name}</div>
                      {p.description && (
                        <div className="text-xs text-muted-foreground mt-1">{p.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}