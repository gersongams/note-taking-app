export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-[#EF9C66] border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
