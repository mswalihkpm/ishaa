import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Trash2, Edit3 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { studentNames } from '@/lib/students';

// Local storage helpers (direct here for clarity)
const STORAGE_KEY = 'batches';

const loadBatches = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveBatches = (batches) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
};

const BatchManagement = ({ user }) => {
  const { toast } = useToast();
  const [showCreateBatchDialog, setShowCreateBatchDialog] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [editingBatch, setEditingBatch] = useState(null);
  const [studentDetails, setStudentDetails] = useState({});

  // Initial load
  useEffect(() => {
    setBatches(loadBatches());
  }, []);

  // Save every time batches change
  useEffect(() => {
    saveBatches(batches);
  }, [batches]);

  const handleStudentSelect = (name) => {
    setSelectedStudents(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const handleSaveBatch = () => {
    if (!batchName.trim()) {
      toast({ variant: "destructive", title: "Name required", description: "Batch name can't be empty." });
      return;
    }
    if (selectedStudents.length === 0) {
      toast({ variant: "destructive", title: "No students", description: "Select at least one student." });
      return;
    }

    const newBatch = {
      id: editingBatch ? editingBatch.id : Date.now().toString(),
      name: batchName.trim(),
      students: selectedStudents,
      createdBy: editingBatch ? editingBatch.createdBy : user.name,
      details: editingBatch ? { ...editingBatch.details, ...studentDetails } : studentDetails
    };

    const updated = editingBatch
      ? batches.map(b => b.id === editingBatch.id ? newBatch : b)
      : [...batches, newBatch];

    setBatches(updated);
    setShowCreateBatchDialog(false);
    setBatchName('');
    setSelectedStudents([]);
    setStudentDetails({});
    setEditingBatch(null);

    toast({ title: editingBatch ? "Batch updated" : "Batch created", className: "bg-green-500 text-white" });
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setBatchName(batch.name);
    setSelectedStudents(batch.students);
    setStudentDetails(batch.details || {});
    setShowCreateBatchDialog(true);
  };

  const handleDelete = (id) => {
    setBatches(batches.filter(b => b.id !== id));
    toast({ title: "Batch deleted", className: "bg-red-500 text-white" });
  };

  const handleDetailChange = (student, detail) => {
    setStudentDetails(prev => ({ ...prev, [student]: detail }));
  };

  return (
    <Card className="bg-card/80 dark:bg-card/70 shadow-lg h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-primary/90">Manage Batches</CardTitle>
          <Dialog open={showCreateBatchDialog} onOpenChange={setShowCreateBatchDialog}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingBatch(null);
                  setBatchName('');
                  setSelectedStudents([]);
                  setStudentDetails({});
                  setShowCreateBatchDialog(true);
                }}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md text-xs px-3 py-1.5 sm:text-sm sm:px-4 sm:py-2 h-auto"
              >
                <PlusCircle className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> {editingBatch ? "Edit Batch" : "Create Batch"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px] bg-card/90 dark:bg-card/85 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle className="text-2xl text-primary">{editingBatch ? "Edit Batch" : "Create New Batch"}</DialogTitle>
                <DialogDescription>
                  {editingBatch ? "Edit batch details below." : "Fill in batch information."}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="batchName" className="text-right text-muted-foreground">Batch Name</Label>
                  <Input
                    id="batchName"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="e.g., Advanced Science"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2 text-muted-foreground">Students</Label>
                  <ScrollArea className="col-span-3 h-[150px] sm:h-[200px] w-full rounded-md border p-4 bg-background/50">
                    <div className="space-y-2">
                      {studentNames.map(name => (
                        <div key={name} className="flex items-center space-x-2">
                          <Checkbox
                            id={`student-${name}`}
                            checked={selectedStudents.includes(name)}
                            onCheckedChange={() => handleStudentSelect(name)}
                          />
                          <label htmlFor={`student-${name}`} className="text-sm font-medium">
                            {name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {selectedStudents.length > 0 && (
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2 text-muted-foreground">Details</Label>
                    <ScrollArea className="col-span-3 h-[150px] sm:h-[200px] w-full rounded-md border p-4 bg-background/50 space-y-3">
                      {selectedStudents.map(name => (
                        <div key={`detail-${name}`}>
                          <Label htmlFor={`detail-${name}`} className="text-sm font-medium">{name}</Label>
                          <Input
                            id={`detail-${name}`}
                            value={studentDetails[name] || ''}
                            onChange={(e) => handleDetailChange(name, e.target.value)}
                            placeholder={`Notes for ${name}`}
                            className="mt-1"
                          />
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowCreateBatchDialog(false); setEditingBatch(null); }}>Cancel</Button>
                <Button onClick={handleSaveBatch} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                  {editingBatch ? "Save Changes" : "Create Batch"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="pt-4 h-[calc(100%-4rem)]">
        <ScrollArea className="h-full pr-2">
          {batches.length > 0 ? (
            <div className="space-y-3">
              {batches.map(batch => (
                <Card key={batch.id} className="bg-background/50 dark:bg-background/40 shadow-sm">
                  <CardHeader className="flex flex-row justify-between items-center py-2 px-3 sm:py-3 sm:px-4">
                    <div>
                      <CardTitle className="text-md sm:text-lg text-primary/80">{batch.name}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">Created by: {batch.createdBy}</CardDescription>
                    </div>
                    <div className="space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(batch)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 h-7 w-7 sm:h-8 sm:w-8">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(batch.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-7 w-7 sm:h-8 sm:w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pb-2 sm:px-4 sm:pb-3">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Students ({batch.students.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {batch.students.map(name => (
                        <span key={name} className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{name}</span>
                      ))}
                    </div>
                    {Object.keys(batch.details || {}).length > 0 && (
                      <>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 mb-0.5">Details:</p>
                        <ul className="list-disc list-inside pl-1 space-y-0.5 text-xs">
                          {Object.entries(batch.details).map(([name, detail]) =>
                            detail.trim() && (
                              <li key={name}><strong>{name}:</strong> {detail}</li>
                            )
                          )}
                        </ul>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-10">No batches yet. Click "Create Batch" to add one.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default BatchManagement;
