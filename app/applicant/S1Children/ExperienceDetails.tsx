import { Button } from '@/components/ui/button';

export default function ExperienceDetails({
  onNext,
  onBack
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold">Experience</h2>
      {/* Add your form fields here */}
      <div className="mt-4 flex justify-between">
        <Button onClick={onBack} className="mr-2">
          Back
        </Button>
        <Button onClick={onNext} className="ml-2">
          Next
        </Button>
      </div>
    </div>
  );
}
