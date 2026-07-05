'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton, ReportSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';

import { HealthScoreGauge } from '@/components/shared/HealthScoreGauge';
import { ReportRow } from '@/components/shared/ReportRow';
import { ClinicalNoteCard } from '@/components/shared/ClinicalNoteCard';
import { NoteEditorForm } from '@/components/shared/NoteEditorForm';
import { MealDayCard } from '@/components/shared/MealDayCard';
import { UploadZone } from '@/components/shared/UploadZone';

import { TopBar } from '@/components/layout/TopBar';
import { Sidebar as LayoutSidebar } from '@/components/layout/Sidebar';

export default function SandboxPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex bg-bg-main min-h-screen">
      <LayoutSidebar 
        basePath="/sandbox"
        items={[
          { label: 'Dashboard', href: '/sandbox', icon: 'fa-chart-pie' },
          { label: 'Reports', href: '/sandbox/reports', icon: 'fa-file-lines' },
        ]} 
      />
      <div className="flex-1 ml-[260px] flex flex-col">
        <TopBar />
        <main className="p-8 space-y-10 max-w-5xl">
          
          <section>
            <h2 className="text-2xl font-bold mb-4">UI Components</h2>
            <div className="flex gap-4 mb-4">
              <Button>Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div className="flex gap-4 mb-4">
              <Badge status="processing">Processing</Badge>
              <Badge status="completed">Completed</Badge>
              <Badge status="failed">Failed</Badge>
              <Badge status="warning">Warning</Badge>
            </div>
            <div className="max-w-md space-y-4 mb-4">
              <Input label="Sample Input" placeholder="Type here..." />
              <Select label="Sample Select" options={[{value: '1', label: 'Option 1'}]} />
            </div>
            
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Modal 
              isOpen={modalOpen} 
              onClose={() => setModalOpen(false)} 
              onConfirm={() => setModalOpen(false)} 
              title="Delete Report" 
              message="Are you sure you want to delete this report?"
              isDestructive
            />
          </section>

          <section className="grid grid-cols-2 gap-6">
            <Card>
              <CardTitle icon={<i className="fa-solid fa-star"></i>}>Card Component</CardTitle>
              <Skeleton className="h-20 w-full mb-4" />
              <ReportSkeleton />
            </Card>
            
            <Card>
              <HealthScoreGauge score={85} />
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Feature Components</h2>
            
            <div className="max-w-xl space-y-4 mb-8">
              <UploadZone onFileSelect={() => {}} />
              <Card>
                <ReportRow id="1" name="Blood_Test_Jul.pdf" date="12 Jul 2026" size="2.4 MB" status="completed" canDelete />
                <ReportRow id="2" name="Processing_Test.pdf" date="14 Jul 2026" status="processing" />
                <Pagination page={1} hasMore={true} onLoadMore={() => {}} />
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <ClinicalNoteCard 
                note={{
                  id: '1', patient_id: '1', doctor_id: '1', doctor_name: 'Smith', note_type: 'prescription', content: 'Patient is recovering well.', created_at: '2026-07-04T00:00:00Z',
                  prescription: { medication_name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'After meals' }
                }} 
              />
              <MealDayCard 
                isActive
                dayData={{
                  day: 1, completed: false, 
                  breakfast: [{ name: 'Oats', portion: '1 bowl', calories: 250 }],
                  lunch: [{ name: 'Salad', portion: '1 plate', calories: 350 }],
                  snack: [], dinner: []
                }} 
              />
            </div>
            
            <div className="mt-8">
              <NoteEditorForm onSubmit={async () => {}} />
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
