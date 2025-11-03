import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Search,
  Loader,
  Clock,
  Tag,
  Trash2,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  event_type:
    | "meetup"
    | "workshop"
    | "webinar"
    | "conference"
    | "social"
    | "other";
  max_attendees: number | null;
  current_attendees: number;
  organized_by: string;
  image_url: string | null;
  registration_link: string | null;
  is_active: boolean;
  organizer_name?: string;
  is_registered?: boolean;
}

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop";

export default function Events() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    location: "",
    event_type: "meetup" as
      | "meetup"
      | "workshop"
      | "webinar"
      | "conference"
      | "social"
      | "other",
    max_attendees: "",
    image_url: "",
    registration_link: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select(`*, alumni:organized_by (name)`)
        .eq("is_active", true)
        .order("event_date", { ascending: true });
      if (error) throw error;
      
      // Only check registration status if user is logged in
      if (user) {
        const eventsWithRegistrationStatus = await Promise.all(
          (data || []).map(async (event: any) => {
            const { data: registrationData } = await supabase
              .from("event_registrations")
              .select("id")
              .eq("event_id", event.id)
              .eq("alumni_id", user.id)
              .single();
            return {
              ...event,
              organizer_name: event.alumni?.name || "Admin",
              is_registered: !!registrationData,
            };
          }),
        );
        setEvents(eventsWithRegistrationStatus);
      } else {
        // For non-logged-in users, just show events without registration status
        const eventsData = (data || []).map((event: any) => ({
          ...event,
          organizer_name: event.alumni?.name || "Admin",
          is_registered: false,
        }));
        setEvents(eventsData);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.role !== "admin") {
      toast.error("Only admins can create events");
      return;
    }
    try {
      setSubmitting(true);
      const { error } = await supabase.from("events").insert([
        {
          title: formData.title,
          description: formData.description,
          event_date: formData.event_date,
          event_time: formData.event_time,
          location: formData.location,
          event_type: formData.event_type,
          max_attendees: formData.max_attendees
            ? parseInt(formData.max_attendees)
            : null,
          image_url: formData.image_url || null,
          registration_link: formData.registration_link || null,
          organized_by: user?.id,
          current_attendees: 0,
        },
      ]);
      if (error) throw error;
      toast.success("Event created successfully!");
      setShowAddModal(false);
      setFormData({
        title: "",
        description: "",
        event_date: "",
        event_time: "",
        location: "",
        event_type: "meetup",
        max_attendees: "",
        image_url: "",
        registration_link: "",
      });
      fetchEvents();
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast.error(error.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (
    eventId: string,
    maxAttendees: number | null,
    currentAttendees: number,
  ) => {
    // Check if user is logged in
    if (!user) {
      toast.error("Please login to register for events");
      navigate("/auth/login");
      return;
    }

    // Check if user is verified
    if (!profile?.verified) {
      toast.error("Only verified users can register for events. Please wait for admin verification.");
      return;
    }

    // Check if event is full
    if (maxAttendees && currentAttendees >= maxAttendees) {
      toast.error("Event is full");
      return;
    }
    try {
      const { error: regError } = await supabase
        .from("event_registrations")
        .insert([
          {
            event_id: eventId,
            alumni_id: user?.id,
            attendance_status: "registered",
          },
        ]);
      if (regError) {
        if (regError.code === "23505") {
          toast.error("You have already registered for this event");
        } else {
          throw regError;
        }
      } else {
        const { error: updateError } = await supabase
          .from("events")
          .update({ current_attendees: currentAttendees + 1 })
          .eq("id", eventId);
        if (updateError) throw updateError;
        toast.success("Successfully registered for the event!");
        fetchEvents();
      }
    } catch (error: any) {
      console.error("Error registering for event:", error);
      toast.error("Failed to register for event");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!profile || profile.role !== "admin") {
      toast.error("Only admins can delete events");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      toast.success("Event deleted successfully!");
      fetchEvents();
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getEventTypeColor = (type: string) => {
    const colors = {
      meetup: "bg-blue-100 text-blue-700",
      workshop: "bg-purple-100 text-purple-700",
      webinar: "bg-green-100 text-green-700",
      conference: "bg-red-100 text-red-700",
      social: "bg-pink-100 text-pink-700",
      other: "bg-gray-100 text-gray-700",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  if (!profile?.verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-600">Only verified users can view events</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <Loader className="w-16 h-16 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Calendar className="w-12 h-12 text-orange-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Upcoming Events
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Stay connected with our community events and activities
          </p>
          <div className="mt-6 flex items-center justify-center">
            <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1 ? "Event" : "Events"} Upcoming
            </span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            {profile?.role === "admin" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Event
              </motion.button>
            )}
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full text-center py-12 bg-white rounded-2xl shadow-lg"
              >
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No events found</p>
                <p className="text-gray-400 text-sm mt-2">
                  Check back later for upcoming events
                </p>
              </motion.div>
            ) : (
              filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image_url || DEFAULT_EVENT_IMAGE}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_EVENT_IMAGE;
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(event.event_type)}`}
                      >
                        {event.event_type.charAt(0).toUpperCase() +
                          event.event_type.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                        <span>
                          {new Date(event.event_date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        <span>{event.event_time}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-green-500" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Users className="w-4 h-4 mr-2 text-purple-500" />
                        <span>
                          {event.current_attendees}
                          {event.max_attendees
                            ? ` / ${event.max_attendees}`
                            : ""}{" "}
                          attendees
                        </span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <div>
                        {event.is_registered ? (
                          <div className="flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Registered
                          </div>
                        ) : !user ? (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              toast.error("Please login to register for events");
                              navigate("/auth/login");
                            }}
                            className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md"
                          >
                            Login to Register
                          </motion.button>
                        ) : !profile?.verified ? (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              toast.error("Only verified users can register for events. Please wait for admin verification.");
                            }}
                            className="w-full px-4 py-2 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed"
                          >
                            Verification Required
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              handleRegister(
                                event.id,
                                event.max_attendees,
                                event.current_attendees,
                              )
                            }
                            disabled={
                              event.max_attendees !== null &&
                              event.current_attendees >= event.max_attendees
                            }
                            className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {event.max_attendees !== null &&
                            event.current_attendees >= event.max_attendees
                              ? "Event Full"
                              : "Register Now"}
                          </motion.button>
                        )}
                      </div>
                      
                      {/* Admin-only delete button */}
                      {profile?.role === 'admin' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDeleteEvent(event.id)}
                          className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all shadow-md"
                          title="Delete event (Admin only)"
                        >
                          <Trash2 className="w-5 h-5 mr-2" />
                          Delete Event
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => !submitting && setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add Event</h2>
                <button
                  onClick={() => !submitting && setShowAddModal(false)}
                  disabled={submitting}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g. Annual Alumni Meet 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Describe the event..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.event_date}
                      onChange={(e) =>
                        setFormData({ ...formData, event_date: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.event_time}
                      onChange={(e) =>
                        setFormData({ ...formData, event_time: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g. Main Auditorium or Online"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type *
                    </label>
                    <select
                      required
                      value={formData.event_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          event_type: e.target.value as any,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="meetup">Meetup</option>
                      <option value="workshop">Workshop</option>
                      <option value="webinar">Webinar</option>
                      <option value="conference">Conference</option>
                      <option value="social">Social</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Attendees (Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_attendees}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_attendees: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.registration_link}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registration_link: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="https://forms.google.com/..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md disabled:opacity-50 flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Event"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
