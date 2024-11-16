'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function PersonalDetails({ onNext }: { onNext: () => void }) {
  const [date, setDate] = useState<Date | undefined>();
  const [isReferred, setIsReferred] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    address: '',
    referrer: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required.';
    if (!formData.lastName) newErrors.lastName = 'Last name is required.';
    if (!date) newErrors.date = 'Date of birth is required.';
    if (!formData.mobile.match(/^\+44\s?7\d{3}\s?\d{6}$/)) {
      newErrors.mobile = 'Invalid UK mobile number.';
    }
    if (!formData.address) newErrors.address = 'Address is required.';
    if (isReferred && !formData.referrer) {
      newErrors.referrer = "Referrer's name is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Personal Details</h2>
      <div className="space-y-4">
        {/* Personal Information */}
        <h2 className="text-lg font-semibold">1.1 Personal Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              required
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              required
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date > new Date() || date < new Date(1920, 0, 1)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
        </div>

        {/* Mobile Number */}
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile Number</Label>
          <Input
            id="mobile"
            placeholder="+44 7700 900000"
            required
            pattern="^\+44\s?7\d{3}\s?\d{6}$"
            value={formData.mobile}
            onChange={(e) =>
              setFormData({ ...formData, mobile: e.target.value })
            }
          />
          {errors.mobile && (
            <p className="text-sm text-red-500">{errors.mobile}</p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Search for your address"
            required
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address}</p>
          )}
        </div>

        {/* Referral */}
        <div className="space-y-2">
          <Label>Referred by someone at the company?</Label>
          <RadioGroup
            onValueChange={(value) => setIsReferred(value === 'yes')}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="referred-yes" />
              <Label htmlFor="referred-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="referred-no" />
              <Label htmlFor="referred-no">No</Label>
            </div>
          </RadioGroup>
        </div>
        {isReferred && (
          <div className="space-y-2">
            <Label htmlFor="referrer">Referrer's Name</Label>
            <Input
              id="referrer"
              placeholder="Enter referrer's name"
              required
              value={formData.referrer}
              onChange={(e) =>
                setFormData({ ...formData, referrer: e.target.value })
              }
            />
            {errors.referrer && (
              <p className="text-sm text-red-500">{errors.referrer}</p>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-4">
        <Button onClick={handleNext} className="w-full">
          Next
        </Button>
      </div>
    </div>
  );
}
