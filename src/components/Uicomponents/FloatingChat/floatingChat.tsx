import { MessageSquareText } from "lucide-react";

export default function FloatingChat() {
  return (
    <button className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-blue-800 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group">
      <MessageSquareText className="w-6 h-6" />
      {/* Tooltip on hover */}
      <span className="absolute right-full mr-4 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat with a Counselor
      </span>
    </button>
  );
}
