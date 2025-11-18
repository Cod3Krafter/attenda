"use client"
import { House, Plus, Shield } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface NavItem {
    href: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    {href:'/dashboard', icon: <House size={25} />},
    {href:'/event', icon: <Plus size={25} />},
    {href:'/security-management', icon: <Shield size={25} />},
]

export default function Footer() {
    const pathname = usePathname();
  return (
    <footer className="max-w-2xl mx-auto bg-card/60 backdrop-blur-sm border border-border/50 px-4 py-2 rounded-t-3xl shadow-lg">
        <ul className="flex justify-center gap-10 pt-2">
            {navItems.map((navItem, index) => {
                return(
                    <div key = {index}>
                        <Link
                            href={navItem.href}            
                            className={`flex items-center justify-center size-12 rounded-full  transition-all duration-300 hover:scale-110
                                ${navItem.href === 
                                    pathname ? 'bg-white/90 scale-110 text-[#5e81ae]'
                                    : 'bg-black/10'}
                            `}
                        >
                            <p>{navItem.icon}</p>
                        </Link>
                    </div>
                )
            })}
        </ul>

      {/* <ul className="flex justify-center gap-10 pt-2">
        <li>
          <Link 
            href="/" 
            className="flex items-center justify-center size-12 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-110"
          >
            <House size={25} />
          </Link>
        </li>
        <li>
          <Link 
            href="/" 
            className="flex items-center justify-center size-12 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-110"
          >
            <Plus size={25} className="font-bold" />
          </Link>
        </li>
        <li>
          <Link 
            href="/" 
            className="flex items-center justify-center size-12 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-110"
          >
            <Shield size={25} />
          </Link>
        </li>
      </ul> */}
    </footer>
  );


  // when i click on each icon i want the page to change
  // Active page icon should have a different color
  // Compare href of an icon against pathname
  // if pathmane === navItem.href ? 
}