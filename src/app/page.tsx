'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TreePine, Download, MessageCircle, Search, Users, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { SearchBar } from '@/components/search/SearchBar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Header />
      <SearchBar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-4 pt-16 pb-20">
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <TreePine className="h-4 w-4" />
          Family genealogy made simple
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">
          Your Family Story,{' '}
          <span className="text-indigo-600">Beautifully Mapped</span>
        </h1>
        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
          Build an interactive family tree, print stunning posters, and invite
          relatives via WhatsApp to grow your tree together.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link href="/tree">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <TreePine className="h-5 w-5" />
              View Family Tree
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/print">
            <Button size="lg" variant="outline" className="gap-2">
              <Download className="h-5 w-5" />
              Print as Poster
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<TreePine className="h-8 w-8 text-indigo-600" />}
            title="Interactive Family Tree"
            description="Zoom, pan, and explore your family connections with a beautiful interactive tree visualization."
          />
          <FeatureCard
            icon={<Download className="h-8 w-8 text-indigo-600" />}
            title="Print as Poster"
            description="Download your family tree as a stunning PDF poster. Perfect for family gatherings and wall displays."
          />
          <FeatureCard
            icon={<MessageCircle className="h-8 w-8 text-green-600" />}
            title="WhatsApp Invite"
            description="Share your tree via WhatsApp and invite family members to add themselves. Watch your tree grow!"
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-indigo-600" />}
            title="Member Profiles"
            description="Rich profiles with photos, bios, contact info, and family connections for every member."
          />
          <FeatureCard
            icon={<Search className="h-8 w-8 text-indigo-600" />}
            title="Smart Search"
            description="Find family members instantly with search filters for age, location, and upcoming birthdays."
          />
          <FeatureCard
            icon={<MessageCircle className="h-8 w-8 text-indigo-600" />}
            title="Messages & Memories"
            description="Leave birthday wishes, share memories, and write condolences on member profiles."
          />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-indigo-600 py-12">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-8 text-center text-white">
          <div>
            <p className="text-3xl font-bold">20+</p>
            <p className="text-indigo-200 text-sm">Family Members</p>
          </div>
          <div>
            <p className="text-3xl font-bold">4</p>
            <p className="text-indigo-200 text-sm">Generations</p>
          </div>
          <div>
            <p className="text-3xl font-bold">100%</p>
            <p className="text-indigo-200 text-sm">Free & Private</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto text-center px-4 py-16">
        <h2 className="text-2xl font-bold">Ready to map your family?</h2>
        <p className="text-gray-600 mt-2">Start with the Sharma family demo or add your own members.</p>
        <Link href="/tree">
          <Button size="lg" className="mt-6 bg-indigo-600 hover:bg-indigo-700 gap-2">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      <MobileNav />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-gray-600 text-sm mt-1">{description}</p>
    </div>
  );
}
