import { CalendarPlus, Calendar as CalendarIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Opportunity } from '@/types/opportunity';
import { format } from 'date-fns';

interface CalendarMenuProps {
  opportunity: Opportunity;
}

const CalendarMenu = ({ opportunity }: CalendarMenuProps) => {
  const formatDateForGoogle = (date: Date) => {
    return format(date, "yyyyMMdd'T'HHmmss");
  };

  const formatDateForICS = (date: Date) => {
    return format(date, "yyyyMMdd'T'HHmmss'Z'");
  };

  const handleGoogleCalendar = () => {
    const startDate = formatDateForGoogle(opportunity.deadline);
    const endDate = formatDateForGoogle(new Date(opportunity.deadline.getTime() + 60 * 60 * 1000)); // 1 hour event
    
    const eventTitle = `Deadline: ${opportunity.title}`;
    const eventDetails = `${opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)} by ${opportunity.organization}\n\nApply here: ${opportunity.applyUrl}`;
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(eventDetails)}&location=${encodeURIComponent(opportunity.location || '')}`;
    
    window.open(googleCalendarUrl, '_blank');
    toast.success('Opening Google Calendar...');
  };

  const handleDownloadICS = () => {
    const startDate = formatDateForICS(opportunity.deadline);
    const endDate = formatDateForICS(new Date(opportunity.deadline.getTime() + 60 * 60 * 1000));
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OpportunityFinder//EN
BEGIN:VEVENT
UID:${opportunity.id}@opportunityfinder
DTSTAMP:${formatDateForICS(new Date())}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:Deadline: ${opportunity.title}
DESCRIPTION:${opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)} by ${opportunity.organization}\\n\\nApply here: ${opportunity.applyUrl}
LOCATION:${opportunity.location || ''}
URL:${opportunity.applyUrl}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${opportunity.title.replace(/[^a-z0-9]/gi, '-')}-deadline.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Calendar file downloaded!');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          <CalendarPlus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={handleGoogleCalendar} className="cursor-pointer">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Add to Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadICS} className="cursor-pointer">
          <CalendarPlus className="mr-2 h-4 w-4" />
          Download .ics file
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CalendarMenu;
