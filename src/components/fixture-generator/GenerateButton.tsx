
import React from 'react';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GenerateButtonProps {
  isGenerating: boolean;
  onGenerate: () => void;
  totalMatches: number;
  totalMatchweeks: number;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  isGenerating,
  onGenerate,
  totalMatches,
  totalMatchweeks
}) => {
  return (
    <div>
      <div className="text-center">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
        >
          {isGenerating ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              Generating Fixtures...
            </div>
          ) : (
            <div className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Generate Complete Season
            </div>
          )}
        </Button>
      </div>

      {isGenerating && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent mr-3"></div>
            <div>
              <p className="font-medium text-green-800">Creating your season fixtures...</p>
              <p className="text-sm text-green-600">
                Processing {totalMatches} matches across {totalMatchweeks} matchweeks
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
