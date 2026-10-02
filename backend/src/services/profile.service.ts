// ============================================================
// OPPORTUNE V4 — Profile Service
// Synchronized with authenticated user profiles
// ============================================================

import { UserProfile } from '../types/opportunity.js';

const profilesStore: Map<string, UserProfile> = new Map();

export class ProfileService {
  async getProfile(userId: string, email: string = ''): Promise<UserProfile> {
    let profile = profilesStore.get(userId);
    if (!profile) {
      profile = {
        id: userId,
        email: email || 'user@opportune.dev',
        fullName: email ? email.split('@')[0] : 'Opportune Explorer',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop',
        headline: 'Full-Stack Developer & Open Source Contributor',
        bio: 'Passionate about building scalable systems, high-performance web applications, and developer tools.',
        location: 'Bengaluru, Karnataka, India',
        phone: '+91 98765 43210',
        githubUrl: 'https://github.com/developer',
        linkedinUrl: 'https://linkedin.com/in/developer',
        portfolioUrl: 'https://opportune.dev',
        resumeUrl: 'https://opportune.dev/resume.pdf',
        skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Redis', 'Python'],
        experiences: [
          {
            id: 'exp-1',
            role: 'Software Engineer',
            company: 'Tech Startup',
            startDate: '2024-01-01',
            isCurrent: true,
            description: 'Building microservices and frontend design systems.',
          },
        ],
        education: [
          {
            id: 'edu-1',
            degree: 'B.Tech in Computer Science',
            fieldOfStudy: 'Computer Science & Engineering',
            institution: 'Indian Institute of Technology',
            startYear: 2020,
            endYear: 2024,
          },
        ],
        preferences: {
          opportunityCategories: ['jobs', 'internships', 'hackathons', 'contests'],
          preferredLocations: ['Bengaluru', 'Remote', 'Pune', 'Hyderabad'],
          preferredJobTypes: ['Full-time', 'Internship'],
          preferredTechnologies: ['React', 'TypeScript', 'Node.js', 'Python'],
          workplacePreference: ['remote', 'hybrid'],
          emailAlerts: true,
          weeklyDigest: true,
          theme: 'dark',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      profilesStore.set(userId, profile);
    }
    return profile;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const profile = await this.getProfile(userId, updates.email || '');
    const updated: UserProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    profilesStore.set(userId, updated);
    return updated;
  }
}

export const profileService = new ProfileService();
