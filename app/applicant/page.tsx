'use client';

import { useState, useEffect } from 'react';
import { Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function RecruitmentForm() {
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [currentSection, setCurrentSection] = useState<string>('item-1');
  const [date, setDate] = useState<Date>();
  const [referral, setReferral] = useState<string>('');
  const [hasReferral, setHasReferral] = useState<boolean>(false);
  const [availability, setAvailability] = useState<{
    [key: string]: string;
  }>({
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: ''
  });

  const isCompleted = (value: string) => completedSections.includes(value);
  const canExpand = (value: string, index: number) =>
    index === 0 || isCompleted(`item-${index}`);

  const handleComplete = (value: string) => {
    if (!completedSections.includes(value)) {
      const newCompletedSections = [...completedSections, value];
      setCompletedSections(newCompletedSections);
      const nextSectionIndex =
        sections.findIndex((section) => section.value === value) + 1;
      if (nextSectionIndex < sections.length) {
        setCurrentSection(sections[nextSectionIndex].value);
      }
    }
  };

  const sections = [
    { title: 'Personal & Experience Details', value: 'item-1' },
    { title: 'Highway Code Test', value: 'item-2' },
    { title: 'Book an Interview', value: 'item-3' },
    { title: 'Book Rider Training', value: 'item-4' },
    { title: 'Add Bank Details', value: 'item-5' }
  ];

  useEffect(() => {
    setCurrentSection('item-1');
  }, []);

  const renderSection1Content = () => {
    return (
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                minLength={2}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                minLength={2}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date of Birth</Label>
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
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <Input
              id="phone"
              placeholder="UK mobile number"
              pattern="^(?:(?:\+|00)?44|0)7\d{9}$"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Start typing to search..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Referred by someone?</Label>
            <RadioGroup
              onValueChange={(value) => setHasReferral(value === 'yes')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="referral-yes" />
                <Label htmlFor="referral-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="referral-no" />
                <Label htmlFor="referral-no">No</Label>
              </div>
            </RadioGroup>
            {hasReferral && (
              <Input
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
                placeholder="Enter referrer's name"
                className="mt-2"
                required
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="experience" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Delivery Experience</Label>
            <RadioGroup required>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cargo-bike" id="exp-1" />
                  <Label htmlFor="exp-1">
                    I have delivered on 4/3 wheel cargo bike before
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bike" id="exp-2" />
                  <Label htmlFor="exp-2">
                    I have delivered parcels on bike before
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="car-van" id="exp-3" />
                  <Label htmlFor="exp-3">
                    I have done multi drop deliveries by car or van
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="can-bike" id="exp-4" />
                  <Label htmlFor="exp-4">I can ride a bike</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="exp-5" />
                  <Label htmlFor="exp-5">None of the above</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Moped License Status</Label>
            <Select required>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="availability" className="mt-4 space-y-4">
          {[
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday'
          ].map((day) => (
            <div key={day} className="space-y-2">
              <Label className="capitalize">{day}</Label>
              <Select
                value={availability[day]}
                onValueChange={(value) =>
                  setAvailability((prev) => ({ ...prev, [day]: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-day">All Day (9AM-6PM)</SelectItem>
                  <SelectItem value="morning">Morning (9AM-1PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (1PM-6PM)</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}

          <div className="space-y-2">
            <Label>Current Employment Status</Label>
            <RadioGroup required>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full-time" id="emp-1" />
                  <Label htmlFor="emp-1">
                    Full time - but looking for different lifestyle
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="part-time" id="emp-2" />
                  <Label htmlFor="emp-2">
                    Part time - but looking for work on the side
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="self-employed" id="emp-3" />
                  <Label htmlFor="emp-3">
                    Self-employed - looking for additional work
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="emp-4" />
                  <Label htmlFor="emp-4">
                    I'm a student looking for opportunities that suit me
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unemployed" id="emp-5" />
                  <Label htmlFor="emp-5">
                    Currently Unemployed and looking for opportunities
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  function renderSectionContent(section: string) {
    switch (section) {
      case 'item-1':
        return renderSection1Content();
      case 'item-2':
        return (
          <div className="space-y-4">
            <p>Please complete the Highway Code Test below:</p>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="question1">
                What does a red traffic light mean?
              </Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your answer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stop">Stop</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="proceed-with-caution">
                    Proceed with caution
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'item-3':
        return (
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="interview-date">Select Interview Date</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date1">June 1, 2023</SelectItem>
                <SelectItem value="date2">June 2, 2023</SelectItem>
                <SelectItem value="date3">June 3, 2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case 'item-4':
        return (
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="training-date">Select Training Date</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date1">June 5, 2023</SelectItem>
                <SelectItem value="date2">June 6, 2023</SelectItem>
                <SelectItem value="date3">June 7, 2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case 'item-5':
        return (
          <>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                type="text"
                id="account-number"
                placeholder="Enter your account number"
                className="w-full"
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="sort-code">Sort Code</Label>
              <Input
                type="text"
                id="sort-code"
                placeholder="Enter your sort code"
                className="w-full"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 md:px-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Rider Recruitment Process</CardTitle>
          <CardDescription>
            Complete each section to proceed to the next step
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion
            type="single"
            value={currentSection}
            onValueChange={setCurrentSection}
            className="w-full space-y-4"
          >
            {sections.map((section, index) => (
              <AccordionItem
                key={section.value}
                value={section.value}
                disabled={!canExpand(section.value, index)}
                className={`rounded-lg border ${
                  !canExpand(section.value, index) ? 'opacity-50' : ''
                }`}
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex w-full items-center space-x-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        isCompleted(section.value)
                          ? 'bg-green-500 text-white'
                          : canExpand(section.value, index)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted(section.value) ? (
                        <Check className="h-6 w-6" />
                      ) : !canExpand(section.value, index) ? (
                        <Lock className="h-5 w-5" />
                      ) : (
                        <span className="text-lg">{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-lg font-medium ${
                        !canExpand(section.value, index)
                          ? 'text-muted-foreground'
                          : ''
                      }`}
                    >
                      {section.title}
                    </span>
                    {isCompleted(section.value) && (
                      <Check className="ml-auto h-5 w-5 text-green-500" />
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6">
                  <div className="space-y-6 py-6">
                    {renderSectionContent(section.value)}
                    <Button
                      onClick={() => handleComplete(section.value)}
                      className="w-full"
                      size="lg"
                    >
                      Complete Section
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
