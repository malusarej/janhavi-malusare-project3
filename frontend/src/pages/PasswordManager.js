import { useState, useEffect } from 'react';
import { useWorkoutsContext } from "../hooks/useWorkoutsContext";
import { useAuthContext } from "../hooks/useAuthContext";

// components
import WorkoutDetails from '../components/WorkoutDetails';
import WorkoutForm from '../components/WorkoutForm';

const PasswordManager = () => {
  const { workouts, dispatch } = useWorkoutsContext();
  const { user } = useAuthContext();
  const [shareUsername, setShareUsername] = useState('');
  const [shareError, setShareError] = useState(null);
  const [sharingRequests, setSharingRequests] = useState([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!user) return;
      try {
        const response = await fetch('/api/workouts', {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        const json = await response.json();
        if (response.ok) {
          dispatch({ type: 'SET_WORKOUTS', payload: json });
        }
      } catch (error) {
        console.error("Error fetching workouts: ", error);
      }
    };

    const fetchSharingRequests = async () => {
      try {
        const response = await fetch('/api/share/requests', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const json = await response.json();

        if (response.ok) {
          setSharingRequests(json);
        } else {
          console.error('Error fetching sharing requests:', json.error || 'Unknown error');
        }
      } catch (error) {
        console.error("Error fetching sharing requests: ", error);
      }
    };

    fetchWorkouts();
    fetchSharingRequests();
  }, [dispatch, user]);

  const handleShareSubmit = async (e) => {
    e.preventDefault();

    // Validate share username
    if (!shareUsername.trim()) {
      setShareError('Please enter a username');
      return;
    }

    // Check if share username is the current user's username
    if (shareUsername === user.username) {
      setShareError('You cannot share passwords with yourself');
      return;
    }

    // Check if the share username exists in the service
    try {
      const response = await fetch(`/api/users/${shareUsername}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const json = await response.json();

      if (!response.ok) {
        setShareError(json.error || 'Failed to check username');
        return;
      }

      // Handle sharing request
      const shareResponse = await fetch(`/api/share/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ shareUsername })
      });

      const shareJson = await shareResponse.json();

      if (!shareResponse.ok) {
        setShareError(shareJson.error || 'Failed to send sharing request');
        return;
      }

      // Clear share username and error on successful submission
      setShareUsername('');
      setShareError(null);
    } catch (error) {
      console.error("Error while sharing password: ", error);
      setShareError('Failed to share password, please try again later');
    }
  };

  const handleAcceptShare = async (requestId) => {
    try {
      const response = await fetch(`/api/share/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (response.ok) {
        // Refresh sharing requests after accepting
        const updatedRequests = sharingRequests.filter(request => request._id !== requestId);
        setSharingRequests(updatedRequests);
      } else {
        console.error('Error accepting sharing request');
      }
    } catch (error) {
      console.error('Error while accepting sharing request:', error);
    }
  };

  const handleRejectShare = async (requestId) => {
    try {
      const response = await fetch(`/api/share/requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (response.ok) {
        // Refresh sharing requests after rejecting
        const updatedRequests = sharingRequests.filter(request => request._id !== requestId);
        setSharingRequests(updatedRequests);
      } else {
        console.error('Error rejecting sharing request');
      }
    } catch (error) {
      console.error('Error while rejecting sharing request:', error);
    }
  };

  return (
    <div className="home">
      <div className="workouts">
        {workouts && workouts.map((workout) => (
          <WorkoutDetails key={workout._id} workout={workout} />
        ))}
      </div>
      <form onSubmit={handleShareSubmit}>
        <input
          type="text"
          value={shareUsername}
          onChange={(e) => setShareUsername(e.target.value)}
          placeholder="Enter username to share passwords"
        />
        <button type="submit">Share</button>
        {shareError && <div className="error">{shareError}</div>}
      </form>
      <div>
        <h3>Sharing Requests</h3>
        <ul>
          {sharingRequests.map(request => (
            <li key={request._id}>
              User {request.requesterUsername} wants to share passwords with you.
              <button onClick={() => handleAcceptShare(request._id)}>Accept</button>
              <button onClick={() => handleRejectShare(request._id)}>Reject</button>
            </li>
          ))}
        </ul>
      </div>
      <WorkoutForm />
    </div>
  );
};

export default PasswordManager;
