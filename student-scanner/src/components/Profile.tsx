import { useEffect, useRef, useState } from 'react';
import { Camera, Upload, UserRound, RefreshCw, Mail, GraduationCap, Hash, BookOpen } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { fetchStudentProfile, uploadStudentProfilePhoto } from '../services/api';

export function Profile() {
  const { student, token, updateStudent } = useAuth();

  const deviceInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || token.startsWith('mock-')) return;

    let active = true;
    setLoading(true);

    fetchStudentProfile(token)
      .then((profile) => {
        if (active) updateStudent(profile);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const choosePhoto = (file?: File) => {
    setMessage('');
    setError('');

    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please choose a JPG, PNG or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('The image must be smaller than 5 MB.');
      return;
    }

    setPreview(URL.createObjectURL(file));
    setSelectedPhoto(file);
  };

  const savePhoto = async () => {
    if (!selectedPhoto || !token) return;

    if (token.startsWith('mock-')) {
      setError('Please sign in with your student account to upload a photo.');
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const updatedStudent = await uploadStudentProfilePhoto(token, selectedPhoto);
      updateStudent(updatedStudent);
      setSelectedPhoto(null);
      setPreview('');
      setMessage('Profile photo updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo upload failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!student) return null;

  const photo = preview || student.profilePhoto || '';

  const details = [
    { label: 'Full Name', value: student.name, icon: UserRound },
    { label: 'PRN', value: student.prn, icon: Hash },
    { label: 'Email Address', value: student.email, icon: Mail },
    { label: 'Department', value: student.department, icon: GraduationCap },
    { label: 'Section', value: student.section, icon: BookOpen },
    { label: 'Semester', value: String(student.semester), icon: BookOpen },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 md:pb-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-hot-pink">Student Account</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-sora text-ink mt-1">My Profile</h1>
        <p className="text-sm text-muted mt-1">Manage your personal information and profile photo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white rounded-3xl border border-hot-pink/15 shadow-sm p-6 flex flex-col items-center text-center">
          <div className="w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-hot-pink to-thistle shadow-lg shadow-hot-pink/20">
            {photo ? (
              <img src={photo} alt="Student profile" className="w-full h-full rounded-full object-cover border-4 border-white" />
            ) : (
              <div className="w-full h-full rounded-full bg-hot-pink/10 border-4 border-white flex items-center justify-center text-hot-pink">
                <UserRound className="w-16 h-16" />
              </div>
            )}
          </div>

          <h2 className="text-lg font-bold text-ink mt-4">{student.name}</h2>
          <p className="text-xs text-muted font-plex-mono mt-1">{student.prn}</p>

          <div className="w-full space-y-2 mt-6">
            <input
              ref={deviceInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => choosePhoto(e.target.files?.[0])}
            />
            <input
              ref={cameraInput}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => choosePhoto(e.target.files?.[0])}
            />

            <button
              onClick={() => deviceInput.current?.click()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-hot-pink text-white py-3 text-sm font-bold hover:opacity-90 transition"
            >
              <Upload className="w-4 h-4" />
              Upload from Device
            </button>

            <button
              onClick={() => cameraInput.current?.click()}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-hot-pink/25 text-hot-pink py-3 text-sm font-bold hover:bg-hot-pink/5 transition"
            >
              <Camera className="w-4 h-4" />
              Take a Photo
            </button>

            {selectedPhoto && (
              <button
                onClick={savePhoto}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-ink text-white py-3 text-sm font-bold disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                {saving ? 'Uploading...' : 'Save Profile Photo'}
              </button>
            )}
          </div>

          <p className="text-[11px] text-muted mt-3">JPG, PNG or WebP · Maximum 5 MB</p>

          {message && <p className="text-sm text-green-600 mt-3">{message}</p>}
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          {loading && <p className="text-xs text-muted mt-3">Refreshing profile...</p>}
        </section>

        <section className="lg:col-span-2 bg-white rounded-3xl border border-hot-pink/15 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-ink">Personal Information</h2>
              <p className="text-xs text-muted mt-1">Your registered student details</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-hot-pink/10 flex items-center justify-center text-hot-pink">
              <UserRound className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {details.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl bg-canvas/70 border border-hot-pink/10 p-4">
                <div className="flex items-center gap-2 text-muted mb-2">
                  <Icon className="w-4 h-4 text-hot-pink" />
                  <span className="text-xs font-semibold">{label}</span>
                </div>
                <p className="text-sm font-bold text-ink break-words">{value || 'Not provided'}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-hot-pink/5 border border-hot-pink/10">
            <p className="text-xs font-semibold text-ink">Profile information</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Your registered academic details are displayed here. Contact your administrator if any of these details need correction.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
