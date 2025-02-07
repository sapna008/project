import React, { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { database } from '../firebase';
import { User, Book, GraduationCap, Phone, Building, Award, Target } from 'lucide-react';

const INTERESTS = [
  'Web Development',
  'Mobile Development',
  'Cloud Computing',
  'DevOps',
  'Artificial Intelligence',
  'Data Science',
  'Cybersecurity',
  'Networking',
  'Linux',
  'Programming Languages'
];

function Profile({ studentId, studentData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: studentData?.name || '',
    email: studentData?.email || '',
    phone: studentData?.phone || '',
    institution: studentData?.institution || '',
    qualification: studentData?.qualification || '',
    yearOfPassing: studentData?.yearOfPassing || '',
    interests: studentData?.interests || [],
    education: studentData?.education || ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const profileRef = ref(database, `students/${studentId}/profile`);
      const snapshot = await get(profileRef);
      if (snapshot.exists()) {
        setFormData(prev => ({ ...prev, ...snapshot.val() }));
      }
    };
    fetchProfile();
  }, [studentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await set(ref(database, `students/${studentId}/profile`), formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  if (!isEditing) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <User className="h-6 w-6 mr-2 text-purple-400" />
            Profile
          </h2>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Edit Profile
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField icon={<User />} label="Name" value={formData.name} />
            <ProfileField icon={<Book />} label="Email" value={formData.email} />
            <ProfileField icon={<Phone />} label="Phone" value={formData.phone} />
            <ProfileField icon={<Building />} label="Institution" value={formData.institution} />
            <ProfileField icon={<GraduationCap />} label="Qualification" value={formData.qualification} />
            <ProfileField icon={<Award />} label="Year of Passing" value={formData.yearOfPassing} />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-400" />
              Areas of Interest
            </h3>
            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <User className="h-6 w-6 mr-2 text-purple-400" />
        Edit Profile
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            disabled
          />
          <FormField
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            disabled
          />
          <FormField
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
          <FormField
            label="Institution"
            value={formData.institution}
            onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
          />
          <FormField
            label="Qualification"
            value={formData.qualification}
            onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
          />
          <FormField
            label="Year of Passing"
            type="number"
            value={formData.yearOfPassing}
            onChange={(e) => setFormData(prev => ({ ...prev, yearOfPassing: e.target.value }))}
          />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Areas of Interest</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {INTERESTS.map((interest) => (
              <label
                key={interest}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  formData.interests.includes(interest)
                    ? 'bg-purple-500/30 border-purple-500'
                    : 'bg-gray-700/30 border-gray-600'
                } border`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={formData.interests.includes(interest)}
                  onChange={() => handleInterestToggle(interest)}
                />
                <span className="text-sm text-white">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

const ProfileField = ({ icon, label, value }) => (
  <div className="bg-gray-700/30 p-4 rounded-lg">
    <div className="flex items-center text-gray-400 mb-1">
      {React.cloneElement(icon, { className: "h-4 w-4 mr-2" })}
      <span className="text-sm">{label}</span>
    </div>
    <div className="text-white">{value || '-'}</div>
  </div>
);

const FormField = ({ label, value, onChange, type = "text", disabled = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 bg-gray-700/30 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    />
  </div>
);

export default Profile;