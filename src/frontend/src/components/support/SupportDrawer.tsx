import { Phone, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer';

export function SupportDrawer() {
  const supportPhone = '+254 700 000 000';
  const supportEmail = 'support@genzapp.co.ke';

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button id="support-drawer-trigger" className="hidden" />
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Customer Support</DrawerTitle>
            <DrawerDescription>
              We're here to help! Reach out to us anytime.
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <Phone className="mt-0.5 h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Phone Support</p>
                <a
                  href={`tel:${supportPhone}`}
                  className="text-sm text-primary hover:underline"
                >
                  {supportPhone}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">
                  Available Mon-Fri, 8am-6pm EAT
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <Mail className="mt-0.5 h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Email Support</p>
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-sm text-primary hover:underline"
                >
                  {supportEmail}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">
                  We'll respond within 24 hours
                </p>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
