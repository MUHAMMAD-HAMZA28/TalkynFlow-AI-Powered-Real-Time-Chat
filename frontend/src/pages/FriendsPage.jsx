import React, { useEffect } from "react";
import { useUserStore } from "../store/useUserStore";
import { Users, UserPlus, UserMinus, Ban, Check, X, MessageSquare, Loader2, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";

const FriendsPage = () => {
  const { 
    friends, 
    recommendedUsers, 
    outgoingRequests,
    isUsersLoading, 
    getMyFriends, 
    getRecommendedUsers, 
    getOutgoingRequests,
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unfriendUser,
    blockUser
  } = useUserStore();

  useEffect(() => {
    getMyFriends();
    getRecommendedUsers();
    getOutgoingRequests();
  }, [getMyFriends, getRecommendedUsers, getOutgoingRequests]);

  return (
    <div className="min-h-screen pt-20 px-4 bg-base-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Users className="size-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Connections</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Friends Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
              <div className="p-6 border-b border-base-300 bg-base-100/50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  My Friends <span className="badge badge-primary px-3 py-2">{friends.length}</span>
                </h2>
              </div>

              {isUsersLoading && friends.length === 0 ? (
                <div className="p-20 text-center">
                  <Loader2 className="size-10 animate-spin mx-auto text-primary" />
                </div>
              ) : friends.length === 0 ? (
                <div className="p-20 text-center text-base-content/60">
                  <Users className="size-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">You haven't added any friends yet.</p>
                  <p className="text-sm">Connect with people below to start chatting!</p>
                </div>
              ) : (
                <div className="divide-y divide-base-300">
                  {friends.map((friend) => (
                    <div key={friend._id} className="p-6 flex items-center justify-between hover:bg-base-200/50 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <img
                            src={friend.profilePic || "/avatar.png"}
                            alt={friend.fullName}
                            className="size-16 rounded-full object-cover border-2 border-primary/20 shadow-sm"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${friend.fullName}`;
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{friend.fullName}</h3>
                          <p className="text-sm text-base-content/60 mt-0.5 max-w-[300px] line-clamp-1">
                            {friend.bio || "Available for chat"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <Link to="/chat" className="btn btn-primary px-6 shadow-md shadow-primary/20">
                          <MessageSquare className="size-4 mr-2" /> Message
                        </Link>
                        
                        <div className="dropdown dropdown-end">
                          <label tabIndex={0} className="btn btn-sm btn-ghost btn-circle">
                            <MoreVertical className="size-4" />
                          </label>
                          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-xl w-48 border border-base-300">
                            <li>
                              <button onClick={() => unfriendUser(friend._id)} className="text-error font-medium py-3">
                                <UserMinus className="size-4" /> Unfriend
                              </button>
                            </li>
                            <li>
                              <button onClick={() => blockUser(friend._id)} className="text-error font-medium py-3">
                                <Ban className="size-4" /> Block User
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sent Requests Section */}
            {outgoingRequests.length > 0 && (
              <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
                <div className="p-6 border-b border-base-300 bg-base-100/50">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    Sent Requests <span className="badge badge-ghost px-3 py-2">{outgoingRequests.length}</span>
                  </h2>
                </div>
                <div className="divide-y divide-base-300">
                  {outgoingRequests.map((req) => (
                    <div key={req._id} className="p-6 flex items-center justify-between hover:bg-base-200/30 transition-colors">
                      <div className="flex items-center gap-5">
                        <img
                          src={req.recipient.profilePic || "/avatar.png"}
                          alt={req.recipient.fullName}
                          className="size-14 rounded-full object-cover border border-base-300 shadow-sm"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${req.recipient.fullName}`;
                          }}
                        />
                        <div>
                          <h3 className="font-bold">{req.recipient.fullName}</h3>
                          <p className="text-xs text-base-content/50 mt-1">Request pending...</p>
                        </div>
                      </div>
                      <button 
                        className="btn btn-outline btn-error btn-sm px-4 rounded-full"
                        onClick={() => cancelFriendRequest(req.recipient._id)}
                      >
                        Cancel Request
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommended Section */}
          <div className="space-y-6">
            <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
              <div className="p-6 border-b border-base-300 bg-base-100/50">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  Recommended
                </h2>
                <p className="text-xs text-base-content/50 mt-1">People you might know</p>
              </div>

              <div className="p-6 space-y-6">
                {recommendedUsers.length === 0 ? (
                  <p className="text-sm text-center py-6 text-base-content/60 italic">No recommendations found.</p>
                ) : (
                  recommendedUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.fullName}
                          className="size-12 rounded-full object-cover border border-base-300 shadow-sm group-hover:border-primary/40 transition-colors"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${user.fullName}`;
                          }}
                        />
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold truncate">{user.fullName}</h3>
                          <p className="text-[10px] text-base-content/40 truncate max-w-[100px] mt-0.5">
                            {user.bio || "Available"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {user.friendStatus === "pending" ? (
                          <button 
                            className="btn btn-sm btn-ghost btn-circle text-error hover:bg-error/10"
                            onClick={() => cancelFriendRequest(user._id)}
                            title="Cancel Request"
                          >
                            <X className="size-4" />
                          </button>
                        ) : user.friendStatus === "received" ? (
                          <div className="flex gap-1">
                            <button 
                              className="btn btn-sm btn-primary btn-circle shadow-sm"
                              onClick={() => acceptFriendRequest(user.requestId || user._id)}
                              title="Accept"
                            >
                              <Check className="size-4" />
                            </button>
                            <button 
                              className="btn btn-sm btn-ghost btn-circle text-error hover:bg-error/10"
                              onClick={() => rejectFriendRequest(user.requestId || user._id)}
                              title="Reject"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="btn btn-sm btn-primary btn-circle shadow-md shadow-primary/20"
                            onClick={() => sendFriendRequest(user._id)}
                            title="Add Friend"
                          >
                            <UserPlus className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
