// Simple ML model using weighted scoring
export const predictDropoutRisk = (student) => {
    if (!student) return { risk: 'high', score: 0 };

    // Calculate attendance score (30% weight)
    const attendanceScore = calculateAttendanceScore(student.attendance);
    console.log("Raw attendance score:", attendanceScore); // Debug log
    
    // Calculate academic score (40% weight)
    const academicScore = calculateAcademicScore(student.marks);
    console.log("Raw academic score:", academicScore); // Debug log
    
    // Ensure all scores are valid numbers
    const validAttendanceScore = isNaN(attendanceScore) ? 0 : attendanceScore;
    const validAcademicScore = isNaN(academicScore) ? 0 : academicScore;

    console.log("Final scores:", { // Debug log
        attendance: validAttendanceScore,
        academic: validAcademicScore
    });
    
    // Calculate final risk score (0-1)
    const riskScore = (0.3 * validAttendanceScore + 0.4 * validAcademicScore);
    console.log("Final risk score:", riskScore); // Debug log
    
    // Classify risk level
    if (riskScore > 0.7) return { risk: 'low', score: riskScore };
    if (riskScore > 0.4) return { risk: 'medium', score: riskScore };
    return { risk: 'high', score: riskScore };
  };
  
  export const calculateAttendanceScore = (attendance) => {
    if (!attendance || !Array.isArray(attendance) || attendance.length === 0) {
        return 0;
    }
    
    // Group attendance by subject
    const subjectAttendance = {};
    attendance.forEach(record => {
        if (record && record.subName && record.status) {
            if (!subjectAttendance[record.subName]) {
                subjectAttendance[record.subName] = { present: 0, total: 0 };
            }
            subjectAttendance[record.subName].total++;
            if (record.status === "Present") {
                subjectAttendance[record.subName].present++;
            }
        }
    });
    
    // Calculate total presents and total sessions across all subjects
    let totalPresent = 0;
    let totalSessions = 0;
    
    Object.values(subjectAttendance).forEach(subject => {
        totalPresent += subject.present;
        totalSessions += subject.total;
    });
    
    // Calculate overall attendance percentage
    const finalScore = totalSessions === 0 ? 0 : totalPresent / totalSessions;
    
    return finalScore;
  };
  
  const calculateAcademicScore = (marks) => {
    if (!marks || !Array.isArray(marks) || marks.length === 0) return 0;
    const validMarks = marks.filter(mark => mark && typeof mark.score === 'number');
    if (validMarks.length === 0) return 0;
    
    // Add initial value 0 to reduce function
    const totalScore = validMarks.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return validMarks.length === 0 ? 0 : (totalScore / validMarks.length) / 100;
  };
  
  const calculateEngagementScore = (activities) => {
    if (!activities || typeof activities.participation !== 'number') return 0;
    return Math.max(0, Math.min(activities.participation / 100, 1)); // Ensure value is between 0 and 1
  };

  export const getRiskFactors = (student) => {
    if (!student) return [];
    
    const factors = [];
    
    if (student.attendance && calculateAttendanceScore(student.attendance) < 0.6) 
      factors.push('Poor Attendance');
    if (student.marks && Array.isArray(student.marks) && 
        student.marks.some(mark => mark && typeof mark.score === 'number' && mark.score < 40))
      factors.push('Low Academic Performance');
    if (student.activities && typeof student.activities.participation === 'number' && 
        student.activities.participation < 50)
      factors.push('Low Engagement');
      
    return factors;
  };