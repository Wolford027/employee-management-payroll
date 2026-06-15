"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingBlock } from "@/components/ui/spinner";
import { EmployeeForm } from "@/modules/employee/EmployeeForm";
import { useEmployee, useSaveEmployee } from "@/modules/employee/hooks";
import { apiErrorMessage } from "@/lib/api";

export default function EditEmployeePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data, isLoading } = useEmployee(id);
  const save = useSaveEmployee(id);

  return (
    <>
      <PageHeader title="Edit Employee" description={data?.full_name} />
      <Card>
        <CardContent className="pt-5">
          {isLoading || !data ? (
            <LoadingBlock />
          ) : (
            <EmployeeForm
              initial={data}
              submitting={save.isPending}
              onSubmit={(values) =>
                save.mutate(values, {
                  onSuccess: () => {
                    toast.success("Employee updated");
                    router.push(`/employees/${id}`);
                  },
                  onError: (e) => toast.error(apiErrorMessage(e)),
                })
              }
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
