import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './private.route';
import PublicRoute from './public.route';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import CreateMeeting from '../pages/CreateMeeting';
import MeetingDetails from '../pages/MeetingDetails';
import MeetingPage from '../pages/MeetingPage';
import OrganizerMeetingDetail from '../pages/OrganizerMeetingDetail';
import ParticipantMeetingDetails from '../pages/DetailParticipantMeetings';
import ParticipantPage from '../pages/ParticipantPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />


      </Route>

      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-meeting" element={<CreateMeeting />} />
        <Route path="/meeting/:id" element={<MeetingDetails />} />
        <Route path="/meetings" element={<MeetingPage  />} />
        <Route path="/meetings/organizer/:id" element={<OrganizerMeetingDetail />} />
        <Route path="/meetings/participant/:id" element={<ParticipantMeetingDetails />} />
        <Route path="/meetings/join/:token" element={<ParticipantMeetingDetails />} />

      </Route>
    </Routes>
  );
};

export default AppRoutes;