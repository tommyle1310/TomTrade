import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import Image from 'next/image';
import AdminOverviewPage from './admin/page';

export default function Home() {
  return (
    <div className="font-sans items-center justify-items-center pb-20 gap-16 sm:p-4">
      <AdminOverviewPage />
    </div>
  );
}
