import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCompare } from '@/hooks/useCompare';
import { Calendar, MapPin, Trophy, ExternalLink, Rocket, Briefcase, Zap, Check, X } from 'lucide-react';

interface CompareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CompareModal = ({ open, onOpenChange }: CompareModalProps) => {
  const { compareList } = useCompare();

  const typeConfig = {
    hackathon: { icon: Rocket, color: 'text-hackathon', bg: 'bg-hackathon/10' },
    internship: { icon: Briefcase, color: 'text-internship', bg: 'bg-internship/10' },
    contest: { icon: Zap, color: 'text-contest', bg: 'bg-contest/10' },
  };

  const getTypeConfig = (type: string) => typeConfig[type as keyof typeof typeConfig] || typeConfig.hackathon;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysLeft = (date: Date) => {
    return Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Compare Opportunities</DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-muted-foreground bg-secondary/50 rounded-tl-lg">
                  Feature
                </th>
                {compareList.map((opp, idx) => {
                  const config = getTypeConfig(opp.type);
                  const Icon = config.icon;
                  return (
                    <th 
                      key={opp.id} 
                      className={`p-3 text-left text-sm font-semibold bg-secondary/50 min-w-[200px] ${idx === compareList.length - 1 ? 'rounded-tr-lg' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${config.bg}`}>
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <span className="truncate max-w-[150px]">{opp.title}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="p-3 text-sm font-medium text-muted-foreground">Type</td>
                {compareList.map((opp) => {
                  const config = getTypeConfig(opp.type);
                  return (
                    <td key={opp.id} className="p-3">
                      <Badge className={`${config.bg} ${config.color} border-0`}>
                        {opp.type.charAt(0).toUpperCase() + opp.type.slice(1)}
                      </Badge>
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-3 text-sm font-medium text-muted-foreground">Organization</td>
                {compareList.map((opp) => (
                  <td key={opp.id} className="p-3 text-sm">{opp.organization}</td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-3 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Deadline
                  </div>
                </td>
                {compareList.map((opp) => {
                  const daysLeft = getDaysLeft(opp.deadline);
                  return (
                    <td key={opp.id} className="p-3 text-sm">
                      <div>{formatDate(opp.deadline)}</div>
                      <div className={`text-xs ${daysLeft <= 5 ? 'text-urgent' : 'text-muted-foreground'}`}>
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-3 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Location
                  </div>
                </td>
                {compareList.map((opp) => (
                  <td key={opp.id} className="p-3 text-sm">
                    {opp.location || <span className="text-muted-foreground">—</span>}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-3 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" /> Prize/Salary
                  </div>
                </td>
                {compareList.map((opp) => (
                  <td key={opp.id} className="p-3 text-sm font-semibold text-internship">
                    {opp.prize || <span className="text-muted-foreground font-normal">—</span>}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-3 text-sm font-medium text-muted-foreground">Tags</td>
                {compareList.map((opp) => (
                  <td key={opp.id} className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {opp.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-3 text-sm font-medium text-muted-foreground">Description</td>
                {compareList.map((opp) => (
                  <td key={opp.id} className="p-3 text-sm text-muted-foreground">
                    <p className="line-clamp-3">{opp.description}</p>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-sm font-medium text-muted-foreground">Apply</td>
                {compareList.map((opp) => (
                  <td key={opp.id} className="p-3">
                    <Button size="sm" asChild>
                      <a href={opp.applyUrl} target="_blank" rel="noopener noreferrer">
                        Apply <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompareModal;
