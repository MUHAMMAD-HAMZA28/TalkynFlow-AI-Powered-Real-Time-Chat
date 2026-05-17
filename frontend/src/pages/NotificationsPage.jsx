import React, { useEffect } from "react";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { useUserStore } from "../store/useUserStore";

const NotificationsPage = () => {
  const { friendRequests, getFriendRequests, acceptFriendRequest, rejectFriendRequest, isUsersLoading } = useUserStore();

  useEffect(() => {
    getFriendRequests();
  }, [getFriendRequests]);

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 bg-base-200">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Bell className="size-6 text-accent" />
            </div>
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
        </div>

        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden min-h-[200px] flex flex-col">
          {isUsersLoading ? (
            <div className="flex-1 flex items-center justify-center">
               <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : friendRequests.length === 0 ? (
            <div className="p-12 text-center text-base-content/60 flex-1 flex flex-col items-center justify-center">
              <Bell className="size-12 mx-auto mb-4 opacity-20" />
              <p>You have no new friend requests.</p>
            </div>
          ) : (
            <div className="divide-y divide-base-300">
              {friendRequests.map((request) => (
                <div
                  key={request._id}
                  className="p-4 flex items-start gap-4 hover:bg-base-200 transition-colors bg-base-200/50"
                >
                  <img
                    src={request.sender.profilePic || "/avatar.png"}
                    alt="avatar"
                    className="size-12 rounded-full object-cover border border-base-300"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${request.sender.fullName}`;
                    }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{request.sender.fullName}</span>{" "}
                      sent you a friend request.
                    </p>
                    <span className="text-xs text-base-content/50">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                    
                    <div className="flex gap-2 mt-3">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => acceptFriendRequest(request._id)}
                      >
                        <Check className="size-4" /> Accept
                      </button>
                      <button 
                        className="btn btn-sm btn-ghost"
                        onClick={() => rejectFriendRequest(request._id)}
                      >
                        <X className="size-4" /> Decline
                      </button>
                    </div>
                  </div>
                  
                  <div className="size-2 rounded-full bg-primary mt-2"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;