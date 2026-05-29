'use client';

import * as React from 'react';
import { Award, Compass, CheckCircle2, Circle, Eye, Download, Share2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Progress } from '@/components/ui/progress';
import { mockCertifications } from '@/lib/mock-data';

export default function CertificationsPage() {
  const [selectedCert, setSelectedCert] = React.useState<any>(null);

  const getCategoryColor = (cat: string) => {
    if (cat === 'Algorithms') return 'success';
    if (cat === 'Problem Solving') return 'primary';
    return 'warning';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" /> Platform Certifications
          </h1>
          <p className="text-xs text-slate-500 font-semibold">Earn verified industry-standard micro-credentials to validate your algorithm design speed and memory complexity capabilities.</p>
        </div>
      </div>

      {/* Grid of Certifications */}
      <div className="grid md:grid-cols-2 gap-6 pt-2">
        {mockCertifications.map((cert) => (
          <Card key={cert.id} className="bg-slate-900/60 border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{cert.category}</span>
                  <h3 className="text-sm font-bold text-slate-200">{cert.title}</h3>
                </div>
                <Badge variant={cert.isEarned ? 'success' : 'outline'}>
                  {cert.isEarned ? 'Earned' : 'In Progress'}
                </Badge>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-semibold">{cert.description}</p>

              {/* Progress or check list */}
              {cert.isEarned ? (
                <div className="space-y-2 pt-2 text-xs font-semibold text-slate-350">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">verification ID:</p>
                  <code className="px-2 py-1 rounded bg-slate-950/60 text-slate-400 border border-slate-850 block w-fit font-mono">{cert.verificationId}</code>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Completion Requirement Progress</span>
                    <span className="text-indigo-400">{cert.progress}%</span>
                  </div>
                  <Progress value={cert.progress} color="primary" />
                </div>
              )}
            </div>

            {/* Bottom action trigger */}
            <div className="pt-6 border-t border-slate-850 mt-5 flex justify-end">
              {cert.isEarned ? (
                <Button size="sm" icon={Eye} onClick={() => setSelectedCert(cert)}>
                  Preview Certificate
                </Button>
              ) : (
                <Button size="sm" variant="outline" icon={Compass} disabled>
                  Continue Syllabus
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Certificate Preview Modal */}
      <Modal isOpen={!!selectedCert} onClose={() => setSelectedCert(null)} title="Verified Micro-Credential" size="lg">
        {selectedCert && (
          <div className="space-y-6 animate-fade-in text-center py-4">
            
            {/* Simulation Certificate Board */}
            <div className="border-4 border-double border-slate-800 bg-slate-950 p-6 md:p-10 rounded-xl space-y-6 relative max-w-xl mx-auto bg-dot-pattern">
              <div className="absolute top-4 left-4 shrink-0 text-slate-700 font-bold text-xs uppercase tracking-widest select-none">CODEARENA AI</div>
              
              <div className="flex justify-center">
                <Award className="w-12 h-12 text-indigo-500" />
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Certificate of accomplishment</span>
                <h3 className="text-lg md:text-xl font-extrabold text-slate-100">{selectedCert.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold max-w-sm mx-auto">
                  This certifies that user has successfully mastered the required curriculum parameters in {selectedCert.category}.
                </p>
              </div>

              <div className="border-t border-slate-850 pt-4 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-450 font-mono">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">verification ID</span>
                  <span>{selectedCert.verificationId}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Issue Date</span>
                  <span>{selectedCert.issueDate}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions footer */}
            <div className="flex justify-center gap-3 border-t border-slate-800/85 pt-4">
              <Button size="sm" variant="outline" icon={Download} onClick={() => alert('Verification PDF download initiated. (mock download)')}>
                Download PDF
              </Button>
              <Button size="sm" variant="primary" icon={Share2} onClick={() => alert('Shared verified credential offset link to Linkedin profile! (mock post)')}>
                Share on LinkedIn
              </Button>
            </div>
            
          </div>
        )}
      </Modal>

    </div>
  );
}
