import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { saveData, loadData } from '@/lib/dataStore';

const BatchManagement = () => {
  const { toast } = useToast();
  const [showCreateBatchDialog, setShowCreateBatchDialog] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [batches, setBatches] = useState(loadData('batches', []));
  const [editingBatch, setEditingBatch] = useState(null);
  const [studentDetails, setStudentDetails] = useState({});

  useEffect(() => {
    saveData('batches', batches);
  }, [batches]);

  const handleStudentSelection = (studentName) => {
    setSelectedStudents(prev =>
      prev.includes(studentName)
        ? prev.filter(s => s !== studentName)
        : [...prev, studentName]
    );
  };

  const handleSaveBatch = () => {
    if (!batchName.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Batch name is required." });
      return;
    }
    if (selectedStudents.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "Select at least one student." });
      return;
    }

    const newBatch = {
      id: editingBatch ? editingBatch.id : Date.now().toString(),
      name: batchName.trim(),
      students: selectedStudents,
      details: { ...studentDetails }
    };

    if (editingBatch) {
      setBatches(prev => prev.map(b => b.id === editingBatch.id ? newBatch : b));
      toast({ title: "Batch Updated", className: "bg-green-500 text-white" });
    } else {
      setBatches(prev => [...prev, newBatch]);
      toast({ title: "Batch Created", className: "bg-green-500 text-white" });
    }

    setBatchName('');
    setSelectedStudents([]);
    setStudentDetails({});
    setEditingBatch(null);
    setShowCreateBatchDialog(false);
  };

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    setBatchName(batch.name);
    setSelectedStudents(batch.students);
    setStudentDetails(batch.details || {});
    setShowCreateBatchDialog(true);
  };

  const handleDeleteBatch = (batchId) => {
    setBatches(prev => prev.filter(b => b.id !== batchId));
    toast({ title: "Batch Deleted", className: "bg-red-500 text-white" });
  };

  const handleStudentDetailChange = (studentName, detail) => {
    setStudentDetails(prev => ({
      ...prev,
      [studentName]: detail
    }));
  };

  return (
    <Card className="shadow-lg h-full">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-xl">Manage Batches</CardTitle>
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
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white"
            >
              <PlusCircle className="mr-1" /> Create Batch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBatch ? "Edit Batch" : "Create New Batch"}</DialogTitle>
              <DialogDescription>
                {editingBatch
                  ? "Update the batch details below."
                  : "Fill in the details to create a new batch."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="batchName">Batch Name</Label>
                <Input
                  id="batchName"
                  value={batchName}
                  onChange={e => setBatchName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Morning Scholars"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Label className="pt-2">Students</Label>
                <ScrollArea className="col-span-3 h-[200px] w-full rounded-md border p-4">
                  <div className="space-y-2">
                    {studentNames.map(student => (
                      <div key={student} className="flex items-center space-x-2">
                        <Checkbox
                          id={`student-${student}`}
                          checked={selectedStudents.includes(student)}
                          onCheckedChange={() => handleStudentSelection(student)}
                        />
                        <label htmlFor={`student-${student}`} className="text-sm">
                          {student}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {selectedStudents.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  <Label className="pt-2">Student Details</Label>
                  <ScrollArea className="col-span-3 h-[200px] w-full rounded-md border p-4">
                    {selectedStudents.map(student => (
                      <div key={student} className="mb-2">
                        <Label htmlFor={`detail-${student}`} className="text-sm">{student}</Label>
                        <Input
                          id={`detail-${student}`}
                          value={studentDetails[student] || ''}
                          onChange={e => handleStudentDetailChange(student, e.target.value)}
                          placeholder={`Notes for ${student}`}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateBatchDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveBatch} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                {editingBatch ? "Save Changes" : "Create Batch"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[calc(100%-4rem)] pr-2">
          {batches.length > 0 ? (
            <div className="space-y-3">
              {batches.map(batch => (
                <Card key={batch.id} className="shadow-sm">
                  <CardHeader className="flex justify-between items-center">
                    <CardTitle>{batch.name}</CardTitle>
                    <div className="space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEditBatch(batch)}>
                        <Edit3 className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteBatch(batch.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Students ({batch.students.length}):</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {batch.students.map(student => (
                        <span key={student} className="px-2 py-0.5 bg-primary/10 rounded-full text-xs">{student}</span>
                      ))}
                    </div>
                    {Object.keys(batch.details || {}).length > 0 && (
                      <>
                        <p className="text-sm mt-2">Details:</p>
                        <ul className="list-disc pl-4">
                          {Object.entries(batch.details).map(([student, detail]) =>
                            detail.trim() && (
                              <li key={student} className="text-xs">{student}: {detail}</li>
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
            <p className="text-center py-10 text-muted-foreground">
              No batches created yet. Click "Create Batch" to get started.
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default BatchManagement;
