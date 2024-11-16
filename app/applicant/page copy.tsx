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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PersonalDetails from './S1Children/PersonalDetails';
import ExperienceDetails from './S1Children/ExperienceDetails';
import AvailabilityDetails from './S1Children/AvailabilityDetails';

const sections = [
  { title: 'Personal & Experience Details', value: 'item-1' },
  { title: 'Highway Code Test', value: 'item-2' },
  { title: 'Book an Interview', value: 'item-3' },
  { title: 'Book Rider Training', value: 'item-4' },
  { title: 'Add Bank Details', value: 'item-5' }
];

export default function RecruitmentForm() {
  const [currentSection, setCurrentSection] = useState<string>('item-1');
  const [currentTabPersonalnExperience, setCurrentTab] =
    useState<string>('personal');
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const handleNext = () => {
    const currentIndex = sections.findIndex(
      (section) => section.value === currentSection
    );
    if (currentIndex < sections.length - 1) {
      setCompletedSections((prev) => [...prev, currentSection]);
      setCurrentSection(sections[currentIndex + 1].value);
      setCurrentTab('personal'); // Reset to the first tab when moving to the next section
    }
  };

  const handleBack = () => {
    const currentIndex = sections.findIndex(
      (section) => section.value === currentSection
    );
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1].value);
      setCurrentTab('personal'); // Reset to the first tab when going back
    }
  };

  const renderCurrentTabComponent = () => {
    switch (currentTabPersonalnExperience) {
      case 'personal':
        return <PersonalDetails onNext={() => setCurrentTab('experience')} />;
      case 'experience':
        return (
          <ExperienceDetails
            onNext={() => setCurrentTab('availability')}
            onBack={() => setCurrentTab('personal')}
          />
        );
      case 'availability':
        return (
          <AvailabilityDetails onBack={() => setCurrentTab('experience')} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-[75vw]">
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
            {sections.map((section) => (
              <AccordionItem key={section.value} value={section.value}>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <span className="text-lg font-medium">{section.title}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6">
                  {section.value === 'item-1' ? (
                    <div>
                      <Tabs className="w-full">
                        <TabsList className="grid grid-cols-3">
                          <TabsTrigger
                            onClick={() => setCurrentTab('personal')}
                            className={`px-4 py-2 ${
                              currentTabPersonalnExperience === 'personal'
                                ? 'border border-white bg-blue-500 text-white'
                                : 'bg-gray-200'
                            }`}
                            disabled
                          >
                            Personal Details
                          </TabsTrigger>
                          <TabsTrigger
                            onClick={() => setCurrentTab('experience')}
                            className={`px-4 py-2 ${
                              currentTabPersonalnExperience === 'experience'
                                ? 'border border-white bg-blue-500 text-white'
                                : 'bg-gray-200'
                            }`}
                            disabled
                          >
                            Experience
                          </TabsTrigger>
                          <TabsTrigger
                            onClick={() => setCurrentTab('availability')}
                            className={`px-4 py-2 ${
                              currentTabPersonalnExperience === 'availability'
                                ? 'border border-white bg-blue-500 text-white'
                                : 'bg-gray-200'
                            }`}
                            disabled
                          >
                            Availability
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent>{renderCurrentTabComponent()}</TabsContent>
                      </Tabs>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-bold">{section.title}</h2>
                      {/* Add content for other sections here */}
                      <div className="mt-4">
                        <button onClick={handleBack} className="mr-2">
                          Back
                        </button>
                        <button onClick={handleNext}>Next</button>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
