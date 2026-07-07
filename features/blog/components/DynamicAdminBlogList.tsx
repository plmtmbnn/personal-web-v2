"use client";

import dynamic from 'next/dynamic';
import { AdminToastProvider } from "@/features/shared/components/AdminToast";

// Dynamically import the AdminBlogList component with no SSR
const AdminBlogList = dynamic(
  () => import("./AdminBlogList"),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center h-64 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
        <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center shadow-xl">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500">Loading blog list...</p>
      </div>
    ),
    ssr: false,
  }
);

// Wrapper component to provide the AdminToastProvider
const DynamicAdminBlogList = (props: React.ComponentProps<typeof AdminBlogList>) => {
  return (
    <AdminToastProvider>
      <AdminBlogList {...props} />
    </AdminToastProvider>
  );
};

export default DynamicAdminBlogList;