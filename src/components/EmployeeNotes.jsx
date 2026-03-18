import React from 'react';
import { MessageSquare, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EMPLOYEE_STATUSES_META = [
  { status: 'contacted',  notesKey: 'notesForContacted',  badge: 'bg-blue-100 text-blue-700' },
  { status: 'inProgress', notesKey: 'notesForInProgress', badge: 'bg-amber-100 text-amber-700' },
  { status: 'completed',  notesKey: 'notesForCompleted',  badge: 'bg-green-100 text-green-700' },
  { status: 'paused',     notesKey: null,                 badge: 'bg-gray-100 text-gray-600' },
];

function EmployeeNotes({ request }) {
  const { t } = useTranslation();

  const entries = EMPLOYEE_STATUSES_META
    .map(({ status, notesKey, badge }) => {
      const note   = notesKey ? request[notesKey] : null;
      const byName = notesKey ? request[`${notesKey}ByName`] : null;
      const label  = t(`status.${status}`) || status;
      return note ? { label, badge, note, byName } : null;
    })
    .filter(Boolean);

  if (!entries.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
        <MessageSquare className="w-3 h-3" /> ملاحظات الموظف
      </p>
      {entries.map(({ label, badge, note, byName }) => (
        <div key={label} className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 flex gap-3 items-start">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap mt-0.5 flex-shrink-0 ${badge}`}>
            {label}
          </span>
          <div className="flex-1">
            <p className="text-sm text-gray-600 leading-relaxed">{note}</p>
            {byName && (
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <User className="w-3 h-3" /> {byName}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EmployeeNotes;