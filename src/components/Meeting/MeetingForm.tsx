import React, { useState } from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';
import CalendarSelector from './CalendarSelector';
import type { CreateMeetingForm } from '../../types/meeting.types';

interface MeetingFormProps {
  onSubmit: (formData: CreateMeetingForm) => void;
  loading?: boolean;
}

const MeetingForm: React.FC<MeetingFormProps> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<CreateMeetingForm>({
    title: '',
    startDate: '',
    endDate: '',
    duration: 1,
    participantEmails: [],
    eventDays: 1,
    timeRange: {
      startTime: '09:00',
      endTime: '17:00'
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    setFormData(prev => ({
      ...prev,
      startDate,
      endDate
    }));
    
    // Clear date-related errors
    if (errors.startDate || errors.endDate) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.startDate;
        delete newErrors.endDate;
        return newErrors;
      });
    }
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({
      ...prev,
      timeRange: {
        startTime: field === 'startTime' ? value : prev.timeRange?.startTime || '09:00',
        endTime: field === 'endTime' ? value : prev.timeRange?.endTime || '17:00'
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Meeting title is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    if (!formData.eventDays || formData.eventDays <= 0) {
      newErrors.eventDays = 'Event days must be greater than 0';
    }
    
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    if (formData.timeRange?.startTime && formData.timeRange?.endTime) {
      if (formData.timeRange.startTime >= formData.timeRange.endTime) {
        newErrors.timeRange = 'End time must be after start time';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          type="text"
          name="title"
          label="Meeting Title"
          placeholder="Team Weekly Sync"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          fullWidth
          required
        />
      </div>
      
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Select Meeting Date Range
        </label>
        <CalendarSelector 
          onDateRangeSelect={handleDateRangeSelect}
          initialStartDate={formData.startDate}
          initialEndDate={formData.endDate}
        />
        {(errors.startDate || errors.endDate) && (
          <p className="text-red-500 text-xs italic mt-1">
            {errors.startDate || errors.endDate}
          </p>
        )}
      </div>
      
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Event Duration (Days)
        </label>
        <div className="flex items-center">
          <input
            type="number"
            name="eventDays"
            value={formData.eventDays}
            onChange={handleChange}
            min="1"
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 w-24"
          />
          <span className="ml-2 text-gray-600">days</span>
        </div>
        {errors.eventDays && (
          <p className="text-red-500 text-xs italic mt-1">{errors.eventDays}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Start Time
          </label>
          <input
            type="time"
            value={formData.timeRange?.startTime || '09:00'}
            onChange={(e) => handleTimeChange('startTime', e.target.value)}
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 w-full"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            End Time
          </label>
          <input
            type="time"
            value={formData.timeRange?.endTime || '17:00'}
            onChange={(e) => handleTimeChange('endTime', e.target.value)}
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 w-full"
          />
        </div>
      </div>
      {errors.timeRange && (
        <p className="text-red-500 text-xs italic mt-1">{errors.timeRange}</p>
      )}
      
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Meeting Duration
        </label>
        <div className="flex items-center">
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            step="1"
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 w-24"
          />
          <span className="ml-2 text-gray-600">hours</span>
        </div>
        {errors.duration && (
          <p className="text-red-500 text-xs italic mt-1">{errors.duration}</p>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? 'Creating...' : 'Create Meeting'}
        </Button>
      </div>
    </form>
  );
};

export default MeetingForm;