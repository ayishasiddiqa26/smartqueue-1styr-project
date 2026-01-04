import React from 'react';
import { Copy, Clock, Zap, Palette, Plus, Minus, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Priority, PrintColor, TIME_SLOTS } from '@/types/printJob';

interface PrintOptionsProps {
  copies: number;
  setCopies: (copies: number) => void;
  color: PrintColor;
  setColor: (color: PrintColor) => void;
  priority: Priority;
  setPriority: (priority: Priority) => void;
  timeSlot: string;
  setTimeSlot: (slot: string) => void;
  comment: string;
  setComment: (comment: string) => void;
}

const PrintOptions: React.FC<PrintOptionsProps> = ({
  copies,
  setCopies,
  color,
  setColor,
  priority,
  setPriority,
  timeSlot,
  setTimeSlot,
  comment,
  setComment,
}) => {
  return (
    <div className="space-y-4">
      {/* Copies */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Number of Copies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-md">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCopies(Math.max(1, copies - 1))}
                disabled={copies <= 1}
                className="h-10 w-10 p-0 rounded-r-none border-r"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={1}
                max={50}
                value={copies}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setCopies(1);
                  } else {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue)) {
                      setCopies(Math.max(1, Math.min(50, numValue)));
                    }
                  }
                }}
                onBlur={(e) => {
                  // Ensure valid value on blur
                  const value = parseInt(e.target.value) || 1;
                  setCopies(Math.max(1, Math.min(50, value)));
                }}
                className="text-lg font-medium w-16 text-center border-0 rounded-none focus-visible:ring-0"
                step={1}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCopies(Math.min(50, copies + 1))}
                disabled={copies >= 50}
                className="h-10 w-10 p-0 rounded-l-none border-l"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              {copies === 1 ? '1 copy' : `${copies} copies`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Color Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Print Color
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={color}
            onValueChange={(value) => setColor(value as PrintColor)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2 flex-1">
              <RadioGroupItem value="black-white" id="black-white" />
              <Label htmlFor="black-white" className="flex-1 cursor-pointer">
                <div className="font-medium">Black & White</div>
                <div className="text-xs text-muted-foreground">Standard printing</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 flex-1">
              <RadioGroupItem value="color" id="color" />
              <Label htmlFor="color" className="flex-1 cursor-pointer">
                <div className="font-medium text-blue-600">Color</div>
                <div className="text-xs text-muted-foreground">Full color printing</div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Time Slot */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pickup Time Slot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={timeSlot} onValueChange={setTimeSlot}>
            <SelectTrigger>
              <SelectValue placeholder="Select a time slot" />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((slot) => (
                <SelectItem key={slot.id} value={slot.id}>
                  <span className="font-medium">{slot.label}</span>
                  <span className="text-muted-foreground ml-2">({slot.time})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Priority */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Priority Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={priority}
            onValueChange={(value) => setPriority(value as Priority)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2 flex-1">
              <RadioGroupItem value="normal" id="normal" />
              <Label htmlFor="normal" className="flex-1 cursor-pointer">
                <div className="font-medium">Normal</div>
                <div className="text-xs text-muted-foreground">Standard queue</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 flex-1">
              <RadioGroupItem value="urgent" id="urgent" />
              <Label htmlFor="urgent" className="flex-1 cursor-pointer">
                <div className="font-medium text-accent">Urgent</div>
                <div className="text-xs text-muted-foreground">Priority processing</div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Comment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Special Instructions (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add any special instructions or notes for the admin (e.g., specific paper type, binding requirements, etc.)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px] resize-none"
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-muted-foreground">
              Optional field for special requests or instructions
            </p>
            <p className="text-xs text-muted-foreground">
              {comment.length}/500
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrintOptions;
