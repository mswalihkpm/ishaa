import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  Checkbox,
  ScrollArea,
  useToast
} from '@/components/ui';
import { PlusCircle, Trash2, Edit3 } from 'lucide-react';
import { studentNames } from '@/lib/students';
import { saveData, loadData } from '@/lib/dataStore';

const BatchManagement = () => {
  const { toast } = useToast();

  const [showDialog, setShowDialog] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [editingBatch, setEditingBatch] = useState(null);
  const [studentDetails, setStudentDetails] = useState({});

  // Load batches once on mount
  useEffect(() => {
    const saved = loadData('batches', []);
    setBatches(saved);
  }, []);

  // Save batches when they change
  useEffect(() => {
    saveData('batches', batches);
  }, [batches]);

  const openNewDialog = () => {
    setEditingBatch(null);
    setBatchName('');
    setSelectedStudents([]);
    setStudentDetails({});
    setShowDialog(true);
  };

  const handleStudentToggle = (student) => {
    setSelectedStudents((prev) =>
      prev.includes(student)
        ? prev.filter((s) => s !== student)
        : [...prev, student]
    );
  };

  const handleSaveBatch = () => {
    if (!batchName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Batch name is required.' });
      return;
    }
    if (selectedStudents.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Select at least one student.' });
      return;
    }

    const newBatch = {
      id: editingBatch ? editingBatch.id : Date.now().toString(),
      name: batchName.trim(),
      students: selectedStudents,
      details: { ...studentDetails }
    };

    if (editingBatch) {
      setBatches((prev) => prev.map((b) => (b.id === editingBatch.id ? newBatch : b)));
      toast({ title: 'Batch Updated', className: 'bg-green-500 text-white' });
    } else {
      setBatches((prev) => [...prev, newBatch]);
      toast({ title: 'Batch Created', className: 'bg-green-500 text-white' });
    }

    setShowDialog(false);
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setBatchName(batch.name);
    setSelectedStudents(batch.students);
    setStudentDetails(batch.details || {});
    setShowDialog(true);
  };

  const handleDelete = (batchId) => {
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
    toast({ title: 'Batch Deleted', className: 'bg-red-500 text-white' });
  };

  const handleDetailChange = (student, detail) => {
    setStudentDetails((prev) => ({ ...prev, [student]: detail }));
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-xl">Manage Batches</CardTitle>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={openNewDialog}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white"
            >
              <PlusCircle className="mr-1" /> Create Batch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBatch ? 'Edit Batch' : 'Create New Batch'}</DialogTitle>
              <DialogDescription>
                {editingBatch ? 'Update the batch details below.' : 'Fill in the details to create a new batch.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="batchName">Batch Name</Label>
                <Input
                  id="batchName"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Label className="pt-2">Students</Label>
                <ScrollArea className="col-span-3 h-[200px] border p-4">
                  {studentNames.map((student) => (
                    <div key={student} className="flex items-center space-x-2">
                      <Checkbox
                        id={student}
                        checked={selectedStudents.includes(student)}
                        onCheckedChange={() => handleStudentToggle(student)}
                      />
                      <label htmlFor={student}>{student}</label>
                    </div>
                  ))}
                </ScrollArea>
              </div>

              {selectedStudents.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  <Label className="pt-2">Details</Label>
                  <ScrollArea className="col-span-3 h-[200px] border p-4 space-y-2">
                    {selectedStudents.map((student) => (
                      <div key={student}>
                        <Label htmlFor={`detail-${student}`}>{student}</Label>
                        <Input
                          id={`detail-${student}`}
                          value={studentDetails[student] || ''}
                          onChange={(e) => handleDetailChange(student, e.target.value)}
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
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveBatch} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                {editingBatch ? 'Save Changes' : 'Create Batch'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[calc(100%-4rem)] pr-2">
          {batches.length > 0 ? (
            batches.map((batch) => (
              <Card key={batch.id} className="shadow-sm mb-4">
                <CardHeader className="flex justify-between items-center">
                  <CardTitle>{batch.name}</CardTitle>
                  <div className="space-x-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(batch)}>
                      <Edit3 className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(batch.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>Students ({batch.students.length}):</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {batch.students.map((student) => (
                      <span key={student} className="px-2 py-1 bg-primary/10 rounded-full text-xs">{student}</span>
                    ))}
                  </div>
                  {Object.keys(batch.details || {}).length > 0 && (
                    <ul className="list-disc pl-4 mt-2">
                      {Object.entries(batch.details).map(([student, detail]) =>
                        detail.trim() && (
                          <li key={student} className="text-xs">{student}: {detail}</li>
                        )
                      )}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center py-10 text-muted-foreground">No batches created yet.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default BatchManagement;

