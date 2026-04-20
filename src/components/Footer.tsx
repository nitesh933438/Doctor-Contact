export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} DocReserve. All rights reserved.</p>
        <p className="text-sm mt-2">Contact: support@docreserve.com | +1 (555) 123-4567</p>
      </div>
    </footer>
  );
}
