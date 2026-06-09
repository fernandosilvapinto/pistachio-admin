const variants = {
  Pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
  Paid:      'bg-green-50 text-green-700 border-green-200',
  Unpaid:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  Active:    'bg-green-50 text-green-700 border-green-200',
  Inactive:  'bg-gray-100 text-gray-500 border-gray-200',
  Admin:     'bg-purple-50 text-purple-700 border-purple-200',
  Manager:   'bg-blue-50 text-blue-700 border-blue-200',
  Mechanic:  'bg-orange-50 text-orange-700 border-orange-200',
  Customer:  'bg-gray-50 text-gray-600 border-gray-200',
};

const Badge = ({ label }) => {
  const styles = variants[label] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${styles}`}>
      {label}
    </span>
  );
};

export default Badge;