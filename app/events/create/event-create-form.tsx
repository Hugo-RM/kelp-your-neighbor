"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { MapPin, Search, Tag as TagIcon, X } from "lucide-react";
import { createClient } from "../../../utils/supabase/client";
import type { FlareMapClientProps } from "./flare-map-client";

interface LocationState {
  lat: number;
  lng: number;
}

interface CreateFlareFormValues {
  title: string;
  description: string;
  venue_name: string;
  start_time: string;
  location: LocationState;
  tags: string[];
  image_url?: string;
}

interface FormFieldErrors {
  title?: string;
  start_time?: string;
  location?: string;
}

interface FormUiState {
  errorMessage: string | null;
  fieldErrors: FormFieldErrors;
}

interface ReverseGeocodeResult {
  address?: {
    county?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
  };
  display_name?: string;
}

interface PhotonFeature {
  properties: {
    name?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    street?: string;
    postcode?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface LocationSuggestion {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
}

const OFFICIAL_TAGS = [
  "#Community",
  "#Outdoors",
  "#Volunteer",
  "#Cleanup",
  "#BeachCleanup",
  "#ParkCleanup",
  "#Concert",
  "#CarShow",
  "#Hike",
  "#Workshop",
  "#Meetup",
  "#Networking",
  "#StudentLife",
  "#FreeFood",
  "#Music",
  "#Arts",
  "#Wellness",
  "#Safety",
  "#FamilyFriendly",
  "#RSVP",
];

const DEFAULT_LOCATION: LocationState = {
  lat: 36.6548,
  lng: -121.8020,
};

const DEFAULT_SEARCH_QUERY = "Monterey, CA";
const EVENT_FORM_ID = "event-create-form";

const FlareLocationMap = dynamic<FlareMapClientProps>(
  () => import("./flare-map-client").then((module) => module.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-2xl border border-amber-100 bg-white text-sm text-slate-600">
        Loading map...
      </div>
    ),
  }
);

function SubmitButton({ formId, isUploadingImage }: { formId?: string; isUploadingImage?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      form={formId}
      disabled={pending || isUploadingImage}
      className="w-full rounded-2xl bg-amber-500 px-4 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/35 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70 animate-[pulse_2.4s_ease-in-out_infinite]"
    >
      {pending || isUploadingImage ? "Creating event..." : "Create event"}
    </button>
  );
}

export default function EventCreateForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [location, setLocation] = useState<LocationState>(DEFAULT_LOCATION);
  const [venueName, setVenueName] = useState<string>("");
  const [tagInput, setTagInput] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [locationSearchQuery, setLocationSearchQuery] = useState<string>(DEFAULT_SEARCH_QUERY);
  const [locationSearchMessage, setLocationSearchMessage] = useState<string>("Map defaults to Monterey / Seaside.");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLocationSearching, setIsLocationSearching] = useState(false);
  const [isLocationSearchFocused, setIsLocationSearchFocused] = useState(false);
  const [nearestAddress, setNearestAddress] = useState<string>("Resolving nearest address...");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uiState, setUiState] = useState<FormUiState>({
    errorMessage: null,
    fieldErrors: {},
  });

  const normalizeTag = (tag: string) => {
    const trimmed = tag.trim().replace(/,+$/, "");
    if (!trimmed) {
      return "";
    }

    return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  };

  const matchingCategorySuggestions = useMemo(() => {
    const query = normalizeTag(tagInput).replace(/^#/, "").toLowerCase();

    return OFFICIAL_TAGS.filter((suggestedTag) => {
      const normalizedSuggestion = suggestedTag.replace(/^#/, "").toLowerCase();
      const isAlreadyAdded = tags.some(
        (existingTag) => existingTag.toLowerCase() === suggestedTag.toLowerCase()
      );

      if (isAlreadyAdded) {
        return false;
      }

      if (!query) {
        return true;
      }

      return normalizedSuggestion.includes(query);
    }).slice(0, 6);
  }, [tagInput, tags]);

  const addTag = (rawTag: string) => {
    const normalized = normalizeTag(rawTag);
    if (!normalized) {
      return;
    }

    setTags((current) => {
      const alreadyExists = current.some(
        (existingTag) => existingTag.toLowerCase() === normalized.toLowerCase()
      );

      if (alreadyExists) {
        return current;
      }

      return [...current, normalized];
    });
    setTagInput("");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      setUiState({
        errorMessage: "Please select a valid image file.",
        fieldErrors: {},
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUiState({
        errorMessage: "Image must be less than 5MB.",
        fieldErrors: {},
      });
      return;
    }

    setSelectedImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
  };

  const clearImageSelection = () => {
    setSelectedImageFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setUploadedImageUrl(null);
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Create a unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const fileExtension = file.name.split(".").pop();
      const fileName = `${timestamp}-${random}.${fileExtension}`;
      const filePath = `event-images/${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("events")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data } = supabase.storage.from("events").getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((current) => current.filter((tag) => tag !== tagToRemove));
  };

  const resolveCountyForLocation = async (nextLocation: LocationState) => {
    const params = new URLSearchParams({
      lat: String(nextLocation.lat),
      lon: String(nextLocation.lng),
      format: "json",
      zoom: "18",
      addressdetails: "1",
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);
    if (!response.ok) {
      return null;
    }

    const result = (await response.json()) as ReverseGeocodeResult;
    return {
      county: result.address?.county ?? "",
      displayName: result.display_name ?? "",
    };
  };

  const formatLocationLabel = (suggestion: LocationSuggestion) =>
    suggestion.city ? `${suggestion.name}, ${suggestion.city}` : suggestion.name;

  const selectLocationSuggestion = (suggestion: LocationSuggestion) => {
    setLocation({ lat: suggestion.lat, lng: suggestion.lng });
    setVenueName(suggestion.name);
    setLocationSearchQuery(formatLocationLabel(suggestion));
    setLocationSuggestions([]);
    setLocationSearchMessage(`Selected ${formatLocationLabel(suggestion)}.`);
    setIsLocationSearchFocused(false);
  };

  useEffect(() => {
    const query = locationSearchQuery.trim();

    if (!query) {
      setLocationSuggestions([]);
      setIsLocationSearching(false);
      setLocationSearchMessage("Map defaults to Monterey / Seaside.");
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLocationSearching(true);

      try {
        const params = new URLSearchParams({
          q: query,
          lat: String(DEFAULT_LOCATION.lat),
          lon: String(DEFAULT_LOCATION.lng),
          limit: "5",
        });

        const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Location search failed");
        }

        const data = (await response.json()) as { features?: PhotonFeature[] };
        const nextSuggestions = (data.features ?? [])
          .map((feature, index) => {
            const coordinates = feature.geometry.coordinates;
            const name = feature.properties.name || feature.properties.street || "Unnamed place";
            const city =
              feature.properties.city ||
              feature.properties.town ||
              feature.properties.village ||
              feature.properties.county ||
              feature.properties.state ||
              "Monterey";

            return {
              id: `${name}-${city}-${coordinates[0]}-${coordinates[1]}-${index}`,
              name,
              city,
              lng: coordinates[0],
              lat: coordinates[1],
            } satisfies LocationSuggestion;
          })
          .filter((suggestion) => suggestion.name || suggestion.city);

        setLocationSuggestions(nextSuggestions);
        setLocationSearchMessage(
          nextSuggestions.length > 0 ? "Choose a place from the list." : "No matches found. Try a different spelling."
        );
      } catch {
        if (!controller.signal.aborted) {
          setLocationSuggestions([]);
          setLocationSearchMessage("Location search is temporarily unavailable.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLocationSearching(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [locationSearchQuery]);

  useEffect(() => {
    let isCancelled = false;

    const timeoutId = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          lat: String(location.lat),
          lon: String(location.lng),
          format: "json",
          zoom: "18",
          addressdetails: "1",
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?${params.toString()}`
        );

        if (!response.ok) {
          if (!isCancelled) {
            setNearestAddress("Nearest address unavailable right now.");
          }
          return;
        }

        const result = (await response.json()) as ReverseGeocodeResult;
        if (!isCancelled) {
          setNearestAddress(result.display_name ?? "No readable address found for this point.");
        }
      } catch {
        if (!isCancelled) {
          setNearestAddress("Nearest address unavailable right now.");
        }
      }
    }, 350);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [location.lat, location.lng]);

  const createFlare = async (formData: FormData) => {
    setUiState({ errorMessage: null, fieldErrors: {} });

    const values: CreateFlareFormValues = {
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      venue_name: String(formData.get("venue_name") ?? venueName).trim(),
      start_time: String(formData.get("start_time") ?? "").trim(),
      location: {
        lat: Number(formData.get("lat") ?? location.lat),
        lng: Number(formData.get("lng") ?? location.lng),
      },
      tags,
      image_url: uploadedImageUrl || undefined,
    };

    const nextFieldErrors: FormFieldErrors = {};

    if (!values.title) {
      nextFieldErrors.title = "A title is required.";
    }

    const startTimeDate = new Date(values.start_time);
    if (!values.start_time || Number.isNaN(startTimeDate.getTime()) || startTimeDate <= new Date()) {
      nextFieldErrors.start_time = "Start time must be in the future.";
    }

    if (nextFieldErrors.title || nextFieldErrors.start_time) {
      setUiState({
        errorMessage: "Please fix the highlighted fields.",
        fieldErrors: nextFieldErrors,
      });
      return;
    }

    if (values.tags.length === 0) {
      setUiState({
        errorMessage: "Add at least one category tag before creating an event.",
        fieldErrors: {},
      });
      return;
    }

    const resolvedLocation = await resolveCountyForLocation(values.location);
    const county = resolvedLocation?.county.toLowerCase() ?? "";

    if (!county.includes("monterey")) {
      setUiState({
        errorMessage: "Please choose a location inside Monterey County.",
        fieldErrors: {
          location: "Location must be inside Monterey County.",
        },
      });
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // const testUserId = "67dbd586-14c5-4311-9c7c-7bf7c6e6fdb4";

    if (userError || !user) {
      setUiState({
        errorMessage: "You must be signed in to create a flare.",
        fieldErrors: {},
      });
      return;
    }

    // Upload image if selected but not yet uploaded
    let imageUrl = uploadedImageUrl;
    if (selectedImageFile && !uploadedImageUrl) {
      try {
        setIsUploadingImage(true);
        imageUrl = await uploadImageToSupabase(selectedImageFile);
        setUploadedImageUrl(imageUrl);
      } catch (error) {
        setUiState({
          errorMessage: `Image upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          fieldErrors: {},
        });
        setIsUploadingImage(false);
        return;
      }
    }

    const insertData: any = {
      title: values.title,
      overview: values.description,
      venue_name: values.venue_name,
      tags: values.tags,
      event_date: startTimeDate.toISOString().split("T")[0],
      start_time: startTimeDate.toISOString(),
      location: `POINT(${values.location.lng} ${values.location.lat})`,
      creator_id: user.id,
      external_id: 'local',
    };

    if (imageUrl) {
      insertData.image_url = imageUrl;
    }

    const { error } = await supabase.from("events").insert(insertData);
    if (error) {
      console.error("Supabase Insert Error:", error.message);
    } else {
      console.log("Flare launched successfully!");
    }
    if (error) {
      setUiState({
        errorMessage: error.message,
        fieldErrors: {},
      });
      return;
    }

    router.push("/map");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.10)] backdrop-blur">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Event information</h2>
          </div>
          
        </div>

        <form id={EVENT_FORM_ID} action={createFlare} className="space-y-5">
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Neighborhood clean-up at Elm Park"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-amber-300 transition focus:ring-2"
            />
            {uiState.fieldErrors.title ? (
              <p className="mt-2 text-sm text-red-600">{uiState.fieldErrors.title}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Share details so neighbors know exactly how to help."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-amber-300 transition focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="event-image" className="mb-2 block text-sm font-medium text-slate-700">
              Event Image (Optional)
            </label>
            <div className="space-y-3">
              <input
                id="event-image"
                name="event-image"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={isUploadingImage}
                className="block w-full cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 file:mr-4 file:cursor-pointer file:border-0 file:rounded-full file:bg-amber-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
              />
              {imagePreviewUrl && (
                <div className="relative inline-block">
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="h-24 w-24 rounded-2xl border border-slate-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearImageSelection}
                    disabled={isUploadingImage}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600 disabled:opacity-70"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-500">
                Upload a cover image for your event (max 5MB, JPG/PNG)
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="start_time" className="mb-2 block text-sm font-medium text-slate-700">
                Start time
              </label>
              <input
                id="start_time"
                name="start_time"
                type="datetime-local"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-amber-300 transition focus:ring-2"
              />
              {uiState.fieldErrors.start_time ? (
                <p className="mt-2 text-sm text-red-600">{uiState.fieldErrors.start_time}</p>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="tag-input" className="mb-2 block text-sm font-medium text-slate-700">
                Category tags
              </label>
              <div className="mb-3 flex flex-wrap gap-2">
                {matchingCategorySuggestions.map((suggestedTag) => (
                  <button
                    key={suggestedTag}
                    type="button"
                    onClick={() => addTag(suggestedTag)}
                    className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-medium text-amber-800 transition hover:bg-amber-50"
                  >
                    {suggestedTag}
                  </button>
                ))}
                {tagInput.trim() && !matchingCategorySuggestions.some(tag => tag.toLowerCase() === normalizeTag(tagInput).toLowerCase()) && (
                  <button
                    type="button"
                    onClick={() => addTag(tagInput)}
                    className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
                  >
                    + Create "{normalizeTag(tagInput)}"
                  </button>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 focus-within:ring-2 focus-within:ring-amber-300">
                <div className="flex min-w-[220px] items-center gap-2">
                  <TagIcon className="h-4 w-4 text-amber-700" />
                  <input
                    id="tag-input"
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                    type="text"
                    placeholder="Type a tag (official or custom), then press Enter"
                    className="w-full bg-transparent py-1 text-sm text-slate-900 outline-none placeholder:text-slate-500"
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-sm text-amber-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="inline-flex items-center justify-center rounded-full p-0.5 text-amber-700 transition hover:bg-amber-200"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Choose from suggested tags or create your own. Press Enter or comma to add any tag.
              </p>
            </div>
          </div>

          <input type="hidden" name="lat" value={location.lat} readOnly />
          <input type="hidden" name="lng" value={location.lng} readOnly />
          <input type="hidden" name="tags" value={JSON.stringify(tags)} readOnly />

          {uiState.fieldErrors.location ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {uiState.fieldErrors.location}
            </p>
          ) : null}

          {uiState.errorMessage ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {uiState.errorMessage}
            </p>
          ) : null}
        </form>
      </section>

      <aside className="rounded-[2rem] border border-amber-100 bg-amber-50/80 p-5 shadow-[0_20px_70px_rgba(251,191,36,0.12)]">
        <h3 className="text-lg font-semibold">Location map</h3>
        <p className="mt-2 text-sm text-slate-600">
          Search for a place or address, pick a result, and the map will fly there automatically.
        </p>

        <div className="mt-4 space-y-3">
          <div className="relative">
            <label htmlFor="location-search" className="mb-2 block text-sm font-medium text-slate-700">
              Search for a place or address.
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="location-search"
                value={locationSearchQuery}
                onChange={(event) => setLocationSearchQuery(event.target.value)}
                onFocus={() => setIsLocationSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsLocationSearchFocused(false), 100)}
                type="text"
                placeholder="Search Monterey addresses"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none ring-amber-300 transition focus:ring-2"
              />
            </div>

            {isLocationSearchFocused ? (
              <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                {isLocationSearching ? (
                  <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-amber-500" />
                    Searching places...
                  </div>
                ) : null}

                {!isLocationSearching && locationSuggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500">{locationSearchMessage}</div>
                ) : null}

                {locationSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectLocationSuggestion(suggestion);
                    }}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-amber-50"
                  >
                    <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {suggestion.name}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {suggestion.city}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <label htmlFor="venue_name" className="mb-2 block text-sm font-medium text-slate-700">
              Venue Name
            </label>
            <input
              id="venue_name"
              name="venue_name"
              value={venueName}
              onChange={(event) => setVenueName(event.target.value)}
              type="text"
              placeholder="Auto-filled when a place is selected"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-amber-300 transition focus:ring-2"
            />
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-600">{locationSearchMessage}</p>

        <div className="mt-4 overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-inner">
          <FlareLocationMap location={location} onLocationChange={setLocation} />
        </div>

        <div className="mt-4 grid gap-2 rounded-2xl bg-white p-4 text-sm shadow-sm">
          <p className="font-medium text-slate-700">Selected coordinates</p>
          <p className="text-slate-600">Latitude: {location.lat.toFixed(6)}</p>
          <p className="text-slate-600">Longitude: {location.lng.toFixed(6)}</p>
          <p className="mt-2 font-medium text-slate-700">Nearest readable address</p>
          <p className="text-slate-600">{nearestAddress}</p>
        </div>

        <div className="mt-6">
          <SubmitButton formId={EVENT_FORM_ID} isUploadingImage={isUploadingImage} />
        </div>
      </aside>
    </div>
  );
}
