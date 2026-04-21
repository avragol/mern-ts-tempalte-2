import { useAppSelector } from "@/redux/hooks";

export default function ProfilePage() {
  const { user: userState } = useAppSelector((state) => state.user);

  if (!userState) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center mb-4">
          {userState?.profilePicture && (
            <img
              src={userState.profilePicture}
              alt={userState.firstName}
              className="w-16 h-16 rounded-full mr-4"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">{userState?.firstName} {userState?.lastName}</h2>
            <p className="text-gray-600">{userState?.email}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p><strong>User ID:</strong> {userState?._id}</p>
          <p><strong>Last Updated:</strong> {userState?.updatedAt}</p>
          <p><strong>Role:</strong> {userState?.role}</p>
          <p><strong>Created At:</strong> {userState?.createdAt}</p>
          {userState?.phone && <p><strong>Phone:</strong> {userState?.phone}</p>}
        </div>
      </div>
    </div>
  );
}
