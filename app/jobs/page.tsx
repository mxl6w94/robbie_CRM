import Link from "next/link";
import { supabase } from "@/lib/supabase/server";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { LinkButton } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, status, clients(name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Jobs</h1>
        <LinkButton href="/jobs/new">New Job</LinkButton>
      </div>

      {jobs.length === 0 ? (
        <p className="text-sm text-gray-500">No jobs yet.</p>
      ) : (
        <Table>
          <Thead>
            <Th>Title</Th>
            <Th>Client</Th>
            <Th>Status</Th>
          </Thead>
          <tbody>
            {jobs.map((job) => (
              <Tr key={job.id}>
                <Td>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    {job.title}
                  </Link>
                </Td>
                <Td>{job.clients?.name ?? "—"}</Td>
                <Td>
                  <StatusBadge status={job.status} />
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
