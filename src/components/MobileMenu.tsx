import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[250px] sm:w-[300px]">
        <div className="flex flex-col gap-4 mt-8">
          <Button 
            variant="ghost" 
            className="justify-start text-lg" 
            onClick={() => handleNavigate("/")}
          >
            Home
          </Button>
          <Button 
            variant="ghost" 
            className="justify-start text-lg" 
            onClick={() => handleNavigate("/store")}
          >
            Store
          </Button>
          <div className="border-t pt-4 mt-4">
            <Button 
              variant="outline" 
              className="w-full justify-start text-lg mb-2" 
              onClick={() => handleNavigate("/auth")}
            >
              Sign In
            </Button>
            <Button 
              variant="hero" 
              className="w-full justify-start text-lg" 
              onClick={() => handleNavigate("/auth")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
