import { useState } from "react";

export const MembershipSection = ({
  memberships = [],
  companyId,
  onAdd,
  onRemove,
  canManage = false,
}) => {
  const [profileId, setProfileId] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await onAdd({
      company_id: companyId,
      profile_id: profileId,
      permissions: [],
    });
    if (ok) {
      setProfileId("");
      setShowForm(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-gray-700">
          Memberships ({memberships.length})
        </h3>
        {canManage && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Add Member"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
          <input
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            required
            placeholder="Profile UUID"
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
          />
          <button
            type="submit"
            className="bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700"
          >
            Add
          </button>
        </form>
      )}

      {memberships.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No members yet.</p>
      ) : (
        <ul className="space-y-1">
          {memberships.map((m) => (
            <li
              key={m.id}
              className="flex justify-between items-center border border-gray-200 rounded px-2 py-1 text-xs"
            >
              <div>
                <span className="font-medium text-gray-800">
                  {m.profiles?.full_name || m.profile_id}
                </span>
                <span className="ml-2 text-gray-400">
                  ({m.profiles?.role || "unknown role"})
                </span>
                <span className="ml-2 text-gray-400">
                  Permissions: {JSON.stringify(m.permissions)}
                </span>
              </div>
              {canManage && (
                <button
                  onClick={() => onRemove(m.id)}
                  className="text-red-500 hover:text-red-700 text-xs ml-2"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
