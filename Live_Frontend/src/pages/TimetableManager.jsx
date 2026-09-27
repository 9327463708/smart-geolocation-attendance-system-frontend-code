import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const TimetableManager = () => {
  const [branch, setBranch] = useState('Computer Engineering');
  const [semester, setSemester] = useState(1);
  const [batch, setBatch] = useState('A');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Array of time ranges for rows
  const [timeSlots, setTimeSlots] = useState([
    { startTime: '09:00', endTime: '10:00' }
  ]);

  // Grid state: day -> array of slot objects matching the timeSlots array by index
  const [grid, setGrid] = useState(() => {
    const initial = {};
    days.forEach(d => initial[d] = [ { subjectName: '', facultyName: '', facultyCode: '' } ]);
    return initial;
  });

  const fetchTimetable = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://smart-geolocation-attendance-system.onrender.com/api/admin/timetable/${branch}/${semester}/${batch}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = res.data;
      if (data.length > 0) {
        setStartDate(data[0].startDate ? new Date(data[0].startDate).toISOString().split('T')[0] : '');
        setEndDate(data[0].endDate ? new Date(data[0].endDate).toISOString().split('T')[0] : '');
        
        // Extract unique times
        let times = [];
        data.forEach(dayRecord => {
           dayRecord.slots.forEach(slot => {
              const timeStr = `${slot.startTime}-${slot.endTime}`;
              if (!times.find(t => `${t.startTime}-${t.endTime}` === timeStr)) {
                 times.push({ startTime: slot.startTime, endTime: slot.endTime });
              }
           });
        });

        // Sort times by start time
        times.sort((a,b) => a.startTime.localeCompare(b.startTime));
        if (times.length === 0) times = [{ startTime: '09:00', endTime: '10:00' }];
        setTimeSlots(times);

        // Build grid
        const newGrid = {};
        days.forEach(d => {
           newGrid[d] = times.map(() => ({ subjectName: '', facultyName: '', facultyCode: '' }));
           const dayRecord = data.find(record => record.dayOfWeek === d);
           if (dayRecord) {
               dayRecord.slots.forEach(slot => {
                  const tIndex = times.findIndex(t => t.startTime === slot.startTime && t.endTime === slot.endTime);
                  if (tIndex !== -1) {
                     newGrid[d][tIndex] = {
                        subjectName: slot.subjectName || '',
                        facultyName: slot.facultyName || '',
                        facultyCode: slot.facultyCode || ''
                     };
                  }
               });
           }
        });
        setGrid(newGrid);
      } else {
        // Reset if no data
        setTimeSlots([{ startTime: '09:00', endTime: '10:00' }]);
        const initial = {};
        days.forEach(d => initial[d] = [ { subjectName: '', facultyName: '', facultyCode: '' } ]);
        setGrid(initial);
        setStartDate('');
        setEndDate('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTimetable();
    // eslint-disable-next-line
  }, [branch, semester, batch]);

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { startTime: '', endTime: '' }]);
    const newGrid = { ...grid };
    days.forEach(d => {
      newGrid[d] = [...newGrid[d], { subjectName: '', facultyName: '' }];
    });
    setGrid(newGrid);
  };

  const updateTimeSlot = (index, field, value) => {
    const updated = [...timeSlots];
    updated[index][field] = value;
    setTimeSlots(updated);
  };

  const updateGridCell = (day, rowIndex, field, value) => {
    const newGrid = { ...grid };
    newGrid[day][rowIndex] = { ...newGrid[day][rowIndex], [field]: value };
    setGrid(newGrid);
  };

  const removeTimeSlot = (index) => {
    const updatedTimes = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updatedTimes);
    const newGrid = {};
    days.forEach(d => {
       newGrid[d] = grid[d].filter((_, i) => i !== index);
    });
    setGrid(newGrid);
  };

  const handleSave = async () => {
    if (!startDate || !endDate) {
      alert('Start Date and End Date are required.');
      return;
    }
    
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      // Save for each day separately to match backend model
      for (const day of days) {
        // Extract slots that have a subjectName filled
        const daySlots = timeSlots.map((time, index) => ({
          startTime: time.startTime,
          endTime: time.endTime,
          subjectName: grid[day][index].subjectName,
          facultyName: grid[day][index].facultyName,
          facultyCode: grid[day][index].facultyCode
        })).filter(s => s.subjectName);

        await axios.post('https://smart-geolocation-attendance-system.onrender.com/api/admin/timetable', {
          branch,
          semester,
          batch,
          dayOfWeek: day,
          startDate,
          endDate,
          slots: daySlots
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setMessage('Weekly timetable saved successfully!');
    } catch (err) {
      console.error(err);
      setMessage('Error saving timetable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6 overflow-x-auto w-full">
      <h2 className="text-xl font-bold mb-4">Manage Timetable</h2>
      
      {message && <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Branch</label>
          <select value={branch} onChange={e => setBranch(e.target.value)} className="w-full p-2 border rounded">
            <option>Computer Engineering</option>
            <option>Information Technology</option>
            <option>AIDS</option>
            <option>Mechanical Engineering</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Semester</label>
          <select value={semester} onChange={e => setSemester(Number(e.target.value))} className="w-full p-2 border rounded">
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Batch</label>
          <select value={batch} onChange={e => setBatch(e.target.value)} className="w-full p-2 border rounded">
            <option value="A">Batch A</option>
            <option value="B">Batch B</option>
            <option value="C">Batch C</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
      </div>

      <div className="overflow-x-auto bg-gray-50 p-2 rounded border">
        <table className="w-full text-sm text-left border-collapse bg-white">
          <thead className="bg-gray-200 text-gray-700 uppercase">
            <tr>
              <th className="p-3 border min-w-[120px] text-center">Time</th>
              {days.map(day => (
                <th key={day} className="p-3 border min-w-[150px] text-center">{day}</th>
              ))}
              <th className="p-3 border min-w-[50px] text-center">Del</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, rowIndex) => (
              <tr key={rowIndex} className="border-b hover:bg-gray-50">
                <td className="p-2 border align-top bg-gray-100">
                  <div className="flex flex-col gap-1 items-center">
                    <input type="time" value={time.startTime} onChange={(e) => updateTimeSlot(rowIndex, 'startTime', e.target.value)} className="p-1 border rounded w-full text-center" />
                    <span className="text-xs text-gray-500 font-bold">TO</span>
                    <input type="time" value={time.endTime} onChange={(e) => updateTimeSlot(rowIndex, 'endTime', e.target.value)} className="p-1 border rounded w-full text-center" />
                  </div>
                </td>
                {days.map(day => (
                  <td key={day} className="p-2 border align-top">
                    <div className="flex flex-col gap-1">
                      <input type="text" placeholder="Subject Name" value={grid[day][rowIndex]?.subjectName || ''} onChange={(e) => updateGridCell(day, rowIndex, 'subjectName', e.target.value)} className="p-1.5 border rounded text-xs w-full" />
                      <input type="text" placeholder="Faculty Name" value={grid[day][rowIndex]?.facultyName || ''} onChange={(e) => updateGridCell(day, rowIndex, 'facultyName', e.target.value)} className="p-1.5 border rounded text-xs w-full" />
                      <input type="text" placeholder="Faculty Code (10-digit)" value={grid[day][rowIndex]?.facultyCode || ''} onChange={(e) => updateGridCell(day, rowIndex, 'facultyCode', e.target.value)} className="p-1.5 border rounded text-xs w-full" maxLength={10} />
                    </div>
                  </td>
                ))}
                <td className="p-2 border text-center align-middle">
                  <button onClick={() => removeTimeSlot(rowIndex)} className="text-red-500 p-2 bg-red-50 rounded hover:bg-red-500 hover:text-white transition-colors" title="Delete Row">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-4">
        <button onClick={addTimeSlot} className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
          + Add Time Row
        </button>
        <button onClick={handleSave} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm shadow hover:bg-blue-700">
          {loading ? 'Saving...' : 'Save Timetable'}
        </button>
      </div>
    </div>
  );
};

export default TimetableManager;
