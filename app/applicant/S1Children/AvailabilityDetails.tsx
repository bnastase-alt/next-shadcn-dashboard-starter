import { Button } from '@/components/ui/button';

export default function AvailabilityDetails({
  onBack,
  isLastTab
}: {
  onBack: () => void;
  isLastTab: boolean;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold">Availability</h2>
      {/* Add your form fields here */}
      <div className="mt-4 flex justify-between">
        <Button onClick={onBack} className="mr-2">
          Back
        </Button>
        <Button onClick={() => alert('Form Submitted!')} className="ml-2">
          {isLastTab ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
