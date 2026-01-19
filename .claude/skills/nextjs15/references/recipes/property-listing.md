---
id: r-property-listing
name: Property Listing
version: 3.0.0
layer: L6
category: recipes
description: Real estate property listing platform with map search, advanced filters, saved searches, and agent profiles
tags: [real-estate, listings, maps, search, filters, properties]
formula: "PropertyListing = SearchResultsPage(t-search-results-page) + ProductDetail(t-product-detail) + MarketingLayout(t-marketing-layout) + DashboardLayout(t-dashboard-layout) + AuthLayout(t-auth-layout) + SettingsPage(t-settings-page) + ProfilePage(t-profile-page) + MediaGallery(o-media-gallery) + FileUploader(o-file-uploader) + ContactForm(o-contact-form) + SearchModal(o-search-modal) + Header(o-header) + Footer(o-footer) + Hero(o-hero) + DataTable(o-data-table) + FilterBar(o-filter-bar) + StatsDashboard(o-stats-dashboard) + Chart(o-chart) + Tabs(o-tabs) + Modal(o-modal) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + StatCard(m-stat-card) + SearchInput(m-search-input) + DatePicker(m-date-picker) + Select(m-select) + RangeSlider(m-range-slider) + Badge(m-badge) + Rating(m-rating) + ImageCarousel(m-image-carousel) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + TransactionalEmail(pt-transactional-email) + PushNotifications(pt-push-notifications) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + Opengraph(pt-opengraph) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + Filtering(pt-filtering) + Search(pt-search) + Pagination(pt-pagination) + Sorting(pt-sorting) + ImageOptimization(pt-image-optimization) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + MapsIntegration(pt-maps-integration) + Geolocation(pt-geolocation) + Geocoding(pt-geocoding) + VirtualTour(pt-virtual-tour) + CronJobs(pt-cron-jobs) + BackgroundJobs(pt-background-jobs) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + InfiniteScroll(pt-infinite-scroll) + OptimisticUpdates(pt-optimistic-updates)"
composes:
  # L4 Templates
  - ../templates/search-results-page.md
  - ../templates/product-detail.md
  - ../templates/marketing-layout.md
  - ../templates/dashboard-layout.md
  - ../templates/auth-layout.md
  - ../templates/settings-page.md
  - ../templates/profile-page.md
  # L3 Organisms
  - ../organisms/media-gallery.md
  - ../organisms/file-uploader.md
  - ../organisms/contact-form.md
  - ../organisms/search-modal.md
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/hero.md
  - ../organisms/data-table.md
  - ../organisms/filter-bar.md
  - ../organisms/stats-dashboard.md
  - ../organisms/chart.md
  - ../organisms/tabs.md
  - ../organisms/modal.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/stat-card.md
  - ../molecules/search-input.md
  - ../molecules/date-picker.md
  - ../molecules/select.md
  - ../molecules/range-slider.md
  - ../molecules/badge.md
  - ../molecules/rating.md
  - ../molecules/image-carousel.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/push-notifications.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  - ../patterns/opengraph.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/search.md
  - ../patterns/pagination.md
  - ../patterns/sorting.md
  - ../patterns/image-optimization.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  # L5 Patterns - Maps & Geospatial
  - ../patterns/maps-integration.md
  - ../patterns/geolocation.md
  - ../patterns/geocoding.md
  - ../patterns/virtual-tour.md
  # L5 Patterns - Background Processing
  - ../patterns/cron-jobs.md
  - ../patterns/background-jobs.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  # L5 Patterns - UI/UX
  - ../patterns/infinite-scroll.md
  - ../patterns/optimistic-updates.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - prisma@6.0.0
  - mapbox-gl@3.0.0
  - react-map-gl@7.0.0
  - uploadthing@6.0.0
skills:
  - maps
  - geospatial
  - file-upload
  - advanced-search
  - image-gallery
  - seo
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

## Overview

A comprehensive real estate listing platform featuring interactive map-based search, advanced property filters, saved searches with alerts, virtual tour integration, and agent/agency profiles. Optimized for SEO with property-specific meta tags and structured data.

## Project Structure

```
app/
├── (marketing)/
│   ├── layout.tsx
│   ├── page.tsx                    # Homepage with search
│   ├── about/page.tsx
│   └── contact/page.tsx
├── (search)/
│   ├── layout.tsx
│   ├── buy/page.tsx                # Buy listings
│   ├── rent/page.tsx               # Rent listings
│   └── sold/page.tsx               # Recently sold
├── property/
│   └── [slug]/
│       ├── page.tsx                # Property detail
│       ├── gallery/page.tsx        # Full gallery
│       └── schedule/page.tsx       # Schedule viewing
├── agents/
│   ├── page.tsx                    # Agent directory
│   └── [slug]/page.tsx             # Agent profile
├── agencies/
│   ├── page.tsx                    # Agency directory
│   └── [slug]/page.tsx             # Agency profile
├── (user)/
│   ├── layout.tsx
│   ├── saved/page.tsx              # Saved properties
│   ├── searches/page.tsx           # Saved searches
│   ├── viewings/page.tsx           # Scheduled viewings
│   └── settings/page.tsx
├── (agent)/                        # Agent dashboard
│   ├── layout.tsx
│   ├── page.tsx                    # Dashboard
│   ├── listings/
│   │   ├── page.tsx                # My listings
│   │   ├── new/page.tsx            # Create listing
│   │   └── [id]/edit/page.tsx      # Edit listing
│   ├── leads/page.tsx              # Inquiries
│   └── analytics/page.tsx
├── api/
│   ├── properties/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   └── search/route.ts
│   ├── agents/route.ts
│   ├── saved/route.ts
│   ├── searches/route.ts
│   ├── inquiries/route.ts
│   └── upload/route.ts
└── components/
    ├── search/
    │   ├── search-bar.tsx
    │   ├── filter-panel.tsx
    │   ├── map-view.tsx
    │   ├── list-view.tsx
    │   └── property-marker.tsx
    ├── property/
    │   ├── property-card.tsx
    │   ├── property-gallery.tsx
    │   ├── property-details.tsx
    │   ├── property-features.tsx
    │   ├── mortgage-calculator.tsx
    │   └── contact-form.tsx
    ├── agents/
    │   ├── agent-card.tsx
    │   └── agent-contact.tsx
    └── maps/
        ├── property-map.tsx
        └── neighborhood-info.tsx
lib/
├── mapbox.ts
├── geo.ts
└── seo.ts
```

## Database Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String
  phone         String?
  avatarUrl     String?
  role          UserRole  @default(USER)
  
  savedProperties SavedProperty[]
  savedSearches   SavedSearch[]
  inquiries       Inquiry[]
  viewings        Viewing[]
  
  agent           Agent?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum UserRole {
  USER
  AGENT
  ADMIN
}

model Agency {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?   @db.Text
  
  // Contact
  email       String
  phone       String?
  website     String?
  
  // Address
  address     String?
  city        String?
  state       String?
  postalCode  String?
  
  // Media
  logoUrl     String?
  bannerUrl   String?
  
  // Social
  facebook    String?
  twitter     String?
  instagram   String?
  linkedin    String?
  
  agents      Agent[]
  properties  Property[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Agent {
  id          String    @id @default(cuid())
  userId      String    @unique
  agencyId    String?
  
  title       String?
  bio         String?   @db.Text
  
  // License
  licenseNumber String?
  licenseState  String?
  
  // Contact
  phone       String?
  email       String
  
  // Experience
  yearsExperience Int?
  specialties String[]
  languages   String[]
  
  // Media
  avatarUrl   String?
  
  // Stats
  listingsCount Int     @default(0)
  soldCount     Int     @default(0)
  
  user        User      @relation(fields: [userId], references: [id])
  agency      Agency?   @relation(fields: [agencyId], references: [id])
  properties  Property[]
  inquiries   Inquiry[]
  viewings    Viewing[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([agencyId])
}

model Property {
  id              String          @id @default(cuid())
  agentId         String
  agencyId        String?
  
  // Basic info
  title           String
  slug            String          @unique
  description     String          @db.Text
  
  // Type & Status
  type            PropertyType
  status          PropertyStatus  @default(ACTIVE)
  listingType     ListingType
  
  // Price
  price           Decimal         @db.Decimal(12, 2)
  pricePerSqft    Decimal?        @db.Decimal(10, 2)
  
  // For rent
  rentPeriod      RentPeriod?
  securityDeposit Decimal?        @db.Decimal(10, 2)
  
  // Address
  address         String
  unit            String?
  city            String
  state           String
  postalCode      String
  country         String          @default("US")
  neighborhood    String?
  
  // Geolocation
  latitude        Float
  longitude       Float
  
  // Details
  bedrooms        Int?
  bathrooms       Float?
  halfBaths       Int?
  sqft            Int?
  lotSize         Float?          // Acres
  yearBuilt       Int?
  stories         Int?
  parking         Int?
  garageSpaces    Int?
  
  // Features
  features        String[]
  amenities       String[]
  appliances      String[]
  
  // HOA
  hoaFee          Decimal?        @db.Decimal(10, 2)
  hoaFrequency    String?
  
  // Utilities
  heating         String?
  cooling         String?
  
  // Media
  images          PropertyImage[]
  virtualTourUrl  String?
  videoUrl        String?
  
  // Dates
  availableDate   DateTime?
  openHouseDate   DateTime?
  
  // SEO
  metaTitle       String?
  metaDescription String?
  
  // Stats
  viewCount       Int             @default(0)
  saveCount       Int             @default(0)
  inquiryCount    Int             @default(0)
  
  agent           Agent           @relation(fields: [agentId], references: [id])
  agency          Agency?         @relation(fields: [agencyId], references: [id])
  savedBy         SavedProperty[]
  inquiries       Inquiry[]
  viewings        Viewing[]
  
  listedAt        DateTime        @default(now())
  soldAt          DateTime?
  soldPrice       Decimal?        @db.Decimal(12, 2)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([agentId])
  @@index([city, state])
  @@index([listingType, status])
  @@index([price])
  @@index([latitude, longitude])
}

enum PropertyType {
  SINGLE_FAMILY
  CONDO
  TOWNHOUSE
  MULTI_FAMILY
  APARTMENT
  LAND
  COMMERCIAL
  OTHER
}

enum PropertyStatus {
  ACTIVE
  PENDING
  SOLD
  OFF_MARKET
  COMING_SOON
}

enum ListingType {
  SALE
  RENT
}

enum RentPeriod {
  MONTHLY
  WEEKLY
  DAILY
}

model PropertyImage {
  id          String   @id @default(cuid())
  propertyId  String
  url         String
  caption     String?
  order       Int      @default(0)
  isPrimary   Boolean  @default(false)
  
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  
  @@index([propertyId])
}

model SavedProperty {
  id          String   @id @default(cuid())
  userId      String
  propertyId  String
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  
  savedAt     DateTime @default(now())
  
  @@unique([userId, propertyId])
}

model SavedSearch {
  id          String   @id @default(cuid())
  userId      String
  
  name        String
  
  // Search criteria (stored as JSON)
  criteria    Json
  
  // Notifications
  emailAlerts Boolean  @default(true)
  frequency   AlertFrequency @default(DAILY)
  
  lastAlertAt DateTime?
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
}

enum AlertFrequency {
  INSTANT
  DAILY
  WEEKLY
}

model Inquiry {
  id          String    @id @default(cuid())
  propertyId  String
  agentId     String
  userId      String?
  
  // Contact info (for non-logged in users)
  name        String
  email       String
  phone       String?
  
  message     String    @db.Text
  
  status      InquiryStatus @default(NEW)
  
  property    Property  @relation(fields: [propertyId], references: [id])
  agent       Agent     @relation(fields: [agentId], references: [id])
  user        User?     @relation(fields: [userId], references: [id])
  
  createdAt   DateTime  @default(now())
  respondedAt DateTime?
  
  @@index([propertyId])
  @@index([agentId])
  @@index([status])
}

enum InquiryStatus {
  NEW
  CONTACTED
  QUALIFIED
  SHOWING_SCHEDULED
  CLOSED
}

model Viewing {
  id          String        @id @default(cuid())
  propertyId  String
  agentId     String
  userId      String
  
  scheduledAt DateTime
  duration    Int           @default(30)  // Minutes
  
  status      ViewingStatus @default(SCHEDULED)
  
  notes       String?
  
  property    Property      @relation(fields: [propertyId], references: [id])
  agent       Agent         @relation(fields: [agentId], references: [id])
  user        User          @relation(fields: [userId], references: [id])
  
  createdAt   DateTime      @default(now())
  
  @@index([propertyId])
  @@index([agentId])
  @@index([scheduledAt])
}

enum ViewingStatus {
  SCHEDULED
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

## Implementation

### Map Search View

```tsx
// components/search/map-view.tsx
'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import { useQuery } from '@tanstack/react-query';
import { PropertyMarker } from './property-marker';
import { PropertyCard } from '../property/property-card';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  initialBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  filters: Record<string, any>;
}

export function MapView({ initialBounds, filters }: MapViewProps) {
  const mapRef = useRef<any>(null);
  const [viewport, setViewport] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    zoom: 12,
  });
  const [bounds, setBounds] = useState(initialBounds);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  
  // Fetch properties within bounds
  const { data: properties, isLoading } = useQuery({
    queryKey: ['map-properties', bounds, filters],
    queryFn: async () => {
      if (!bounds) return [];
      
      const params = new URLSearchParams({
        north: String(bounds.north),
        south: String(bounds.south),
        east: String(bounds.east),
        west: String(bounds.west),
        ...filters,
      });
      
      const res = await fetch(`/api/properties/search?${params}`);
      return res.json();
    },
    enabled: !!bounds,
  });
  
  // Update bounds on map move
  const handleMoveEnd = useCallback(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      const mapBounds = map.getBounds();
      setBounds({
        north: mapBounds.getNorth(),
        south: mapBounds.getSouth(),
        east: mapBounds.getEast(),
        west: mapBounds.getWest(),
      });
    }
  }, []);
  
  // Cluster properties by proximity
  const clusters = useMemo(() => {
    if (!properties) return [];
    // For simplicity, returning all properties as markers
    // In production, use supercluster for clustering
    return properties;
  }, [properties]);
  
  return (
    <div className="relative h-full">
      <Map
        ref={mapRef}
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
        
        {/* Property Markers */}
        {clusters?.map((property: any) => (
          <Marker
            key={property.id}
            latitude={property.latitude}
            longitude={property.longitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedProperty(property);
            }}
          >
            <PropertyMarker
              price={property.price}
              isSelected={selectedProperty?.id === property.id}
            />
          </Marker>
        ))}
        
        {/* Selected Property Popup */}
        {selectedProperty && (
          <Popup
            latitude={selectedProperty.latitude}
            longitude={selectedProperty.longitude}
            anchor="bottom"
            offset={40}
            onClose={() => setSelectedProperty(null)}
            closeButton={false}
            className="property-popup"
          >
            <PropertyCard
              property={selectedProperty}
              variant="compact"
            />
          </Popup>
        )}
      </Map>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg">
          <p className="text-sm text-gray-600">Loading properties...</p>
        </div>
      )}
      
      {/* Results count */}
      {properties && (
        <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium">
            {properties.length} properties in this area
          </p>
        </div>
      )}
    </div>
  );
}
```

### Advanced Filter Panel

```tsx
// components/search/filter-panel.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, ChevronDown } from 'lucide-react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROPERTY_TYPES = [
  { value: 'SINGLE_FAMILY', label: 'Single Family' },
  { value: 'CONDO', label: 'Condo' },
  { value: 'TOWNHOUSE', label: 'Townhouse' },
  { value: 'MULTI_FAMILY', label: 'Multi-Family' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'LAND', label: 'Land' },
];

const FEATURES = [
  'Pool', 'Garage', 'Fireplace', 'Basement', 'Central AC',
  'Hardwood Floors', 'Updated Kitchen', 'Waterfront', 'Golf Course',
];

export function FilterPanel({ isOpen, onClose }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    beds: searchParams.get('beds') || '',
    baths: searchParams.get('baths') || '',
    minSqft: searchParams.get('minSqft') || '',
    maxSqft: searchParams.get('maxSqft') || '',
    propertyTypes: searchParams.getAll('type') || [],
    features: searchParams.getAll('feature') || [],
    yearBuiltMin: searchParams.get('yearBuiltMin') || '',
    yearBuiltMax: searchParams.get('yearBuiltMax') || '',
    parking: searchParams.get('parking') || '',
    lotSize: searchParams.get('lotSize') || '',
  });
  
  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  
  const toggleArrayFilter = (key: string, value: string) => {
    setFilters((prev) => {
      const arr = prev[key as keyof typeof prev] as string[];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };
  
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Clear existing filter params
    ['minPrice', 'maxPrice', 'beds', 'baths', 'minSqft', 'maxSqft', 'type', 'feature'].forEach(
      (key) => params.delete(key)
    );
    
    // Add new filter params
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.beds) params.set('beds', filters.beds);
    if (filters.baths) params.set('baths', filters.baths);
    if (filters.minSqft) params.set('minSqft', filters.minSqft);
    if (filters.maxSqft) params.set('maxSqft', filters.maxSqft);
    
    filters.propertyTypes.forEach((type) => params.append('type', type));
    filters.features.forEach((feature) => params.append('feature', feature));
    
    router.push(`?${params.toString()}`);
    onClose();
  };
  
  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      beds: '',
      baths: '',
      minSqft: '',
      maxSqft: '',
      propertyTypes: [],
      features: [],
      yearBuiltMin: '',
      yearBuiltMax: '',
      parking: '',
      lotSize: '',
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={onClose} />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl overflow-y-auto lg:relative lg:max-w-none lg:shadow-none lg:border-l">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear all
            </button>
            <button onClick={onClose} className="p-2 lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Price Range */}
          <div>
            <h3 className="font-medium mb-3">Price Range</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-500">Min</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  placeholder="No min"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">Max</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  placeholder="No max"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
          
          {/* Beds & Baths */}
          <div>
            <h3 className="font-medium mb-3">Beds & Baths</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-500">Bedrooms</label>
                <select
                  value={filters.beds}
                  onChange={(e) => updateFilter('beds', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500">Bathrooms</label>
                <select
                  value={filters.baths}
                  onChange={(e) => updateFilter('baths', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Property Type */}
          <div>
            <h3 className="font-medium mb-3">Property Type</h3>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleArrayFilter('propertyTypes', type.value)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    filters.propertyTypes.includes(type.value)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Square Footage */}
          <div>
            <h3 className="font-medium mb-3">Square Footage</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-500">Min</label>
                <input
                  type="number"
                  value={filters.minSqft}
                  onChange={(e) => updateFilter('minSqft', e.target.value)}
                  placeholder="No min"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">Max</label>
                <input
                  type="number"
                  value={filters.maxSqft}
                  onChange={(e) => updateFilter('maxSqft', e.target.value)}
                  placeholder="No max"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
          
          {/* Features */}
          <div>
            <h3 className="font-medium mb-3">Features</h3>
            <div className="grid grid-cols-2 gap-2">
              {FEATURES.map((feature) => (
                <label
                  key={feature}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.features.includes(feature)}
                    onChange={() => toggleArrayFilter('features', feature)}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm">{feature}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4">
          <button
            onClick={applyFilters}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Property Detail Page

```tsx
// app/property/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PropertyGallery } from '@/components/property/property-gallery';
import { PropertyDetails } from '@/components/property/property-details';
import { PropertyFeatures } from '@/components/property/property-features';
import { MortgageCalculator } from '@/components/property/mortgage-calculator';
import { ContactForm } from '@/components/property/contact-form';
import { PropertyMap } from '@/components/maps/property-map';
import { generatePropertySchema } from '@/lib/seo';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const property = await prisma.property.findUnique({
    where: { slug },
    include: { images: true },
  });
  
  if (!property) return {};
  
  return {
    title: property.metaTitle || `${property.bedrooms} bed, ${property.bathrooms} bath ${property.type.replace('_', ' ')} for ${property.listingType === 'SALE' ? 'Sale' : 'Rent'} - ${property.city}, ${property.state}`,
    description: property.metaDescription || property.description.slice(0, 160),
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 200),
      images: property.images.filter(i => i.isPrimary).map(i => i.url),
    },
  };
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  
  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: 'asc' } },
      agent: {
        include: {
          user: true,
          agency: true,
        },
      },
      agency: true,
    },
  });
  
  if (!property) {
    notFound();
  }
  
  // Increment view count
  await prisma.property.update({
    where: { id: property.id },
    data: { viewCount: { increment: 1 } },
  });
  
  // Get similar properties
  const similarProperties = await prisma.property.findMany({
    where: {
      id: { not: property.id },
      city: property.city,
      listingType: property.listingType,
      status: 'ACTIVE',
      price: {
        gte: Number(property.price) * 0.8,
        lte: Number(property.price) * 1.2,
      },
    },
    include: { images: { where: { isPrimary: true } } },
    take: 4,
  });
  
  // JSON-LD structured data
  const jsonLd = generatePropertySchema(property);
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Gallery */}
        <PropertyGallery images={property.images} />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    property.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    property.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {property.status === 'ACTIVE' ? 'For ' + (property.listingType === 'SALE' ? 'Sale' : 'Rent') : property.status}
                  </span>
                  {property.type.replace('_', ' ')}
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  {property.address}
                </h1>
                <p className="text-gray-600">
                  {property.city}, {property.state} {property.postalCode}
                </p>
                
                <div className="flex items-center gap-6 mt-4">
                  <p className="text-3xl font-bold text-indigo-600">
                    ${Number(property.price).toLocaleString()}
                    {property.listingType === 'RENT' && <span className="text-lg font-normal">/mo</span>}
                  </p>
                  
                  <div className="flex items-center gap-4 text-gray-600">
                    {property.bedrooms && (
                      <span>{property.bedrooms} beds</span>
                    )}
                    {property.bathrooms && (
                      <span>{property.bathrooms} baths</span>
                    )}
                    {property.sqft && (
                      <span>{property.sqft.toLocaleString()} sqft</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">About this property</h2>
                <p className="text-gray-600 whitespace-pre-line">{property.description}</p>
              </div>
              
              {/* Details */}
              <PropertyDetails property={property} />
              
              {/* Features */}
              <PropertyFeatures
                features={property.features}
                amenities={property.amenities}
                appliances={property.appliances}
              />
              
              {/* Map */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Location</h2>
                <div className="h-80 rounded-lg overflow-hidden">
                  <PropertyMap
                    latitude={property.latitude}
                    longitude={property.longitude}
                    address={property.address}
                  />
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Agent Contact */}
              <div className="bg-white rounded-lg border p-6 sticky top-4">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={property.agent.avatarUrl || '/default-avatar.png'}
                    alt={property.agent.user.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{property.agent.user.name}</p>
                    {property.agency && (
                      <p className="text-sm text-gray-500">{property.agency.name}</p>
                    )}
                    <p className="text-sm text-gray-500">{property.agent.phone}</p>
                  </div>
                </div>
                
                <ContactForm
                  propertyId={property.id}
                  agentId={property.agentId}
                  propertyAddress={property.address}
                />
              </div>
              
              {/* Mortgage Calculator */}
              {property.listingType === 'SALE' && (
                <MortgageCalculator price={Number(property.price)} />
              )}
            </div>
          </div>
          
          {/* Similar Properties */}
          {similarProperties.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-6">Similar Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProperties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
```

### Mortgage Calculator

```tsx
// components/property/mortgage-calculator.tsx
'use client';

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface MortgageCalculatorProps {
  price: number;
}

export function MortgageCalculator({ price }: MortgageCalculatorProps) {
  const [homePrice, setHomePrice] = useState(price);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [propertyTax, setPropertyTax] = useState(Math.round(price * 0.012 / 12));
  const [insurance, setInsurance] = useState(150);
  const [hoa, setHoa] = useState(0);
  
  const calculation = useMemo(() => {
    const downPayment = homePrice * (downPaymentPercent / 100);
    const loanAmount = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    // Monthly principal & interest
    const monthlyPI = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    // PMI if down payment < 20%
    const pmi = downPaymentPercent < 20 ? loanAmount * 0.005 / 12 : 0;
    
    const totalMonthly = monthlyPI + propertyTax + insurance + hoa + pmi;
    
    return {
      downPayment,
      loanAmount,
      monthlyPI: Math.round(monthlyPI),
      pmi: Math.round(pmi),
      propertyTax,
      insurance,
      hoa,
      total: Math.round(totalMonthly),
    };
  }, [homePrice, downPaymentPercent, interestRate, loanTerm, propertyTax, insurance, hoa]);
  
  const chartData = [
    { name: 'Principal & Interest', value: calculation.monthlyPI, color: '#6366f1' },
    { name: 'Property Tax', value: calculation.propertyTax, color: '#8b5cf6' },
    { name: 'Insurance', value: calculation.insurance, color: '#a855f7' },
    { name: 'HOA', value: calculation.hoa, color: '#c084fc' },
    { name: 'PMI', value: calculation.pmi, color: '#d8b4fe' },
  ].filter(item => item.value > 0);
  
  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="font-semibold mb-4">Mortgage Calculator</h3>
      
      {/* Monthly Payment */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-500">Estimated Monthly Payment</p>
        <p className="text-3xl font-bold text-indigo-600">
          ${calculation.total.toLocaleString()}
        </p>
      </div>
      
      {/* Chart */}
      <div className="h-40 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Breakdown */}
      <div className="space-y-2 mb-6">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
            </div>
            <span>${item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
      
      {/* Inputs */}
      <div className="space-y-4 border-t pt-4">
        <div>
          <label className="text-sm text-gray-500">Home Price</label>
          <input
            type="number"
            value={homePrice}
            onChange={(e) => setHomePrice(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        
        <div>
          <label className="text-sm text-gray-500">Down Payment ({downPaymentPercent}%)</label>
          <input
            type="range"
            min="0"
            max="50"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-sm text-gray-600 text-right">
            ${calculation.downPayment.toLocaleString()}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-500">Interest Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Loan Term (years)</label>
            <select
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value={15}>15 years</option>
              <option value={20}>20 years</option>
              <option value={30}>30 years</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| [search-results-page](../templates/search-results-page.md) | L5 | Property search with map/list views |
| [product-detail](../templates/product-detail.md) | L5 | Property detail page layout |
| [marketing-layout](../templates/marketing-layout.md) | L5 | Homepage and landing pages |
| [media-gallery](../organisms/media-gallery.md) | L4 | Property photo galleries |
| [file-uploader](../organisms/file-uploader.md) | L4 | Agent listing image uploads |
| [contact-form](../organisms/contact-form.md) | L4 | Property inquiry forms |
| [search-modal](../organisms/search-modal.md) | L4 | Location search overlay |
| [filtering](../patterns/filtering.md) | L3 | Property filters (price, beds, etc.) |
| [search](../patterns/search.md) | L3 | Location autocomplete |
| [image-optimization](../patterns/image-optimization.md) | L3 | Gallery image loading |

## Testing

### Test Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/setup.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock mapbox-gl
vi.mock('mapbox-gl', () => ({
  Map: vi.fn(),
  Marker: vi.fn(),
  Popup: vi.fn(),
  NavigationControl: vi.fn(),
  GeolocateControl: vi.fn(),
}));

// Mock react-map-gl
vi.mock('react-map-gl', () => ({
  default: vi.fn(({ children }) => children),
  Marker: vi.fn(({ children }) => children),
  Popup: vi.fn(({ children }) => children),
  NavigationControl: vi.fn(),
  GeolocateControl: vi.fn(),
}));
```

### Unit Tests

```typescript
// __tests__/components/mortgage-calculator.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MortgageCalculator } from '@/components/property/mortgage-calculator';

describe('MortgageCalculator', () => {
  it('calculates monthly payment correctly', () => {
    render(<MortgageCalculator price={500000} />);

    // Default 20% down, 6.5% rate, 30 years
    // Loan: $400,000
    // Expected P&I: ~$2,528/month
    expect(screen.getByText(/Estimated Monthly Payment/i)).toBeInTheDocument();
  });

  it('updates when price changes', () => {
    render(<MortgageCalculator price={500000} />);

    const priceInput = screen.getByDisplayValue('500000');
    fireEvent.change(priceInput, { target: { value: '600000' } });

    // Payment should increase
  });

  it('shows PMI for down payments under 20%', () => {
    render(<MortgageCalculator price={500000} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '10' } });

    expect(screen.getByText(/PMI/i)).toBeInTheDocument();
  });

  it('does not show PMI for 20%+ down payment', () => {
    render(<MortgageCalculator price={500000} />);

    // Default is 20%, PMI should not be in breakdown
    const pmiElements = screen.queryAllByText(/PMI/i);
    // PMI value should be 0 or not shown
  });

  it('displays payment breakdown chart', () => {
    render(<MortgageCalculator price={500000} />);

    expect(screen.getByText(/Principal & Interest/i)).toBeInTheDocument();
    expect(screen.getByText(/Property Tax/i)).toBeInTheDocument();
    expect(screen.getByText(/Insurance/i)).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/property-search.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const mockProperties = [
  {
    id: 'prop-1',
    title: '123 Main St',
    price: 450000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    latitude: 40.7128,
    longitude: -74.006,
  },
];

const server = setupServer(
  rest.get('/api/properties/search', (req, res, ctx) => {
    return res(ctx.json(mockProperties));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Property Search', () => {
  it('displays search results', async () => {
    // Render search page and verify properties display
  });

  it('filters by price range', async () => {
    server.use(
      rest.get('/api/properties/search', (req, res, ctx) => {
        const minPrice = req.url.searchParams.get('minPrice');
        if (minPrice === '500000') {
          return res(ctx.json([]));
        }
        return res(ctx.json(mockProperties));
      })
    );

    // Apply filter and verify results
  });

  it('filters by bedrooms', async () => {
    // Test bedroom filter
  });

  it('updates map markers on filter change', async () => {
    // Test map integration
  });
});
```

### E2E Tests

```typescript
// e2e/property-search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Property Search', () => {
  test('user can search for properties by location', async ({ page }) => {
    await page.goto('/buy');

    // Enter location
    await page.fill('input[placeholder*="location"]', 'San Francisco, CA');
    await page.keyboard.press('Enter');

    // Verify results load
    await expect(page.locator('.property-card')).toHaveCount({ min: 1 });
  });

  test('user can filter by price', async ({ page }) => {
    await page.goto('/buy');

    // Open filters
    await page.click('text="Filters"');

    // Set price range
    await page.fill('input[placeholder="No min"]', '300000');
    await page.fill('input[placeholder="No max"]', '500000');

    // Apply filters
    await page.click('text="Show Results"');

    // Verify URL params updated
    expect(page.url()).toContain('minPrice=300000');
    expect(page.url()).toContain('maxPrice=500000');
  });

  test('user can view property details', async ({ page }) => {
    await page.goto('/buy');

    // Click on first property
    await page.click('.property-card >> nth=0');

    // Verify detail page loads
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.property-gallery')).toBeVisible();
  });

  test('user can save a property', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/property/test-property-slug');

    // Save property
    await page.click('button[aria-label="Save property"]');

    // Verify saved
    await expect(page.locator('text="Saved"')).toBeVisible();
  });

  test('user can submit inquiry', async ({ page }) => {
    await page.goto('/property/test-property-slug');

    // Fill contact form
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="phone"]', '555-1234');
    await page.fill('textarea[name="message"]', 'Interested in scheduling a viewing');

    await page.click('text="Send Message"');

    // Verify success
    await expect(page.locator('text="Message sent"')).toBeVisible();
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Property listing error:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              We couldn't load this property. Please try again.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### API Error Handler

```typescript
// lib/api-errors.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class PropertyNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Property not found: ${identifier}`);
    this.name = 'PropertyNotFoundError';
  }
}

export class GeocodingError extends Error {
  constructor(address: string) {
    super(`Could not geocode address: ${address}`);
    this.name = 'GeocodingError';
  }
}

export function handleAPIError(error: unknown): Response {
  console.error('API Error:', error);

  if (error instanceof PropertyNotFoundError) {
    return Response.json(
      { error: error.message },
      { status: 404 }
    );
  }

  if (error instanceof GeocodingError) {
    return Response.json(
      { error: error.message, code: 'GEOCODING_FAILED' },
      { status: 400 }
    );
  }

  if (error instanceof APIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return Response.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }

  return Response.json({ error: 'Unknown error' }, { status: 500 });
}
```

## Accessibility

```tsx
// components/accessible-property-card.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

interface AccessiblePropertyCardProps {
  property: {
    id: string;
    slug: string;
    title: string;
    address: string;
    city: string;
    state: string;
    price: number;
    listingType: 'SALE' | 'RENT';
    bedrooms: number | null;
    bathrooms: number | null;
    sqft: number | null;
    imageUrl: string | null;
  };
}

export function AccessiblePropertyCard({ property }: AccessiblePropertyCardProps) {
  const priceFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  const features = [
    property.bedrooms && `${property.bedrooms} bedroom${property.bedrooms > 1 ? 's' : ''}`,
    property.bathrooms && `${property.bathrooms} bathroom${property.bathrooms > 1 ? 's' : ''}`,
    property.sqft && `${property.sqft.toLocaleString()} square feet`,
  ].filter(Boolean).join(', ');

  return (
    <article
      className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
      aria-labelledby={`property-title-${property.id}`}
    >
      <Link
        href={`/property/${property.slug}`}
        className="block focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
      >
        {/* Image */}
        <div className="relative aspect-video bg-gray-100">
          {property.imageUrl ? (
            <Image
              src={property.imageUrl}
              alt={`Exterior view of ${property.address}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full" aria-hidden="true">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Price */}
          <p className="text-xl font-bold text-indigo-600">
            {priceFormatted}
            {property.listingType === 'RENT' && (
              <span className="text-base font-normal">/mo</span>
            )}
          </p>

          {/* Title/Address */}
          <h3
            id={`property-title-${property.id}`}
            className="font-semibold mt-1 line-clamp-1"
          >
            {property.address}
          </h3>
          <p className="text-sm text-gray-600">
            {property.city}, {property.state}
          </p>

          {/* Features */}
          {features && (
            <p className="text-sm text-gray-500 mt-2">
              <span className="sr-only">Features: </span>
              {features}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}

// WCAG 2.1 AA Compliance Checklist:
// - Color contrast ratio >= 4.5:1 for normal text
// - Color contrast ratio >= 3:1 for large text
// - Focus indicators visible on all interactive elements
// - Meaningful alt text for property images
// - Screen reader announces property details
// - Keyboard navigation support
// - Proper heading hierarchy
```

## Security

### Input Validation

```typescript
// lib/validation/property.ts
import { z } from 'zod';

export const createPropertySchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(10000),
  type: z.enum(['SINGLE_FAMILY', 'CONDO', 'TOWNHOUSE', 'MULTI_FAMILY', 'APARTMENT', 'LAND', 'COMMERCIAL', 'OTHER']),
  listingType: z.enum(['SALE', 'RENT']),
  price: z.number().positive().max(100000000),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  state: z.string().length(2),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  bedrooms: z.number().int().min(0).max(50).optional(),
  bathrooms: z.number().min(0).max(50).optional(),
  sqft: z.number().int().positive().max(100000).optional(),
  lotSize: z.number().positive().max(10000).optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear() + 1).optional(),
  features: z.array(z.string().max(100)).max(50).optional(),
});

export const inquirySchema = z.object({
  propertyId: z.string().cuid(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^[\d\-\(\)\s\+]+$/).max(20).optional(),
  message: z.string().min(10).max(2000),
});

export const searchSchema = z.object({
  north: z.number().min(-90).max(90).optional(),
  south: z.number().min(-90).max(90).optional(),
  east: z.number().min(-180).max(180).optional(),
  west: z.number().min(-180).max(180).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  beds: z.coerce.number().int().min(0).max(20).optional(),
  baths: z.coerce.number().min(0).max(20).optional(),
  type: z.array(z.string()).optional(),
});
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimits = {
  // Property search: 100 per minute
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:search',
  }),

  // Inquiries: 10 per hour per IP
  inquiry: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'ratelimit:inquiry',
  }),

  // Property creation: 20 per hour (for agents)
  createProperty: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
    prefix: 'ratelimit:create-property',
  }),

  // Image uploads: 50 per hour
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 h'),
    prefix: 'ratelimit:upload',
  }),
};

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const { success, remaining, reset } = await limiter.limit(identifier);
  return { success, remaining, reset };
}
```

## Performance

### Caching Strategies

```typescript
// lib/cache.ts
import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

// Cache property detail for 10 minutes
export const getCachedProperty = unstable_cache(
  async (slug: string) => {
    return prisma.property.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: 'asc' } },
        agent: {
          include: { user: true, agency: true },
        },
        agency: true,
      },
    });
  },
  ['property'],
  { revalidate: 600, tags: ['properties'] }
);

// Cache search results for 2 minutes
export const getCachedSearchResults = unstable_cache(
  async (params: {
    north: number;
    south: number;
    east: number;
    west: number;
    filters: Record<string, unknown>;
  }) => {
    return prisma.property.findMany({
      where: {
        status: 'ACTIVE',
        latitude: { gte: params.south, lte: params.north },
        longitude: { gte: params.west, lte: params.east },
        // Apply other filters...
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
      },
      take: 100,
    });
  },
  ['search'],
  { revalidate: 120, tags: ['search'] }
);

// Revalidate cache after mutations
export async function revalidatePropertyCache(propertyId: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('properties');
  revalidateTag(`property-${propertyId}`);
  revalidateTag('search');
}
```

## CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  NEXT_PUBLIC_MAPBOX_TOKEN: ${{ secrets.MAPBOX_TOKEN }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgis/postgis:15-3.3
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: realestate_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/realestate_test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    needs: [lint, test, e2e]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring

### Sentry Integration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});
```

### Health Checks

```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      mapbox: 'unknown',
    },
  };

  try {
    // Check database with geospatial query
    await prisma.$queryRaw`SELECT ST_Point(0, 0)`;
    health.services.database = 'healthy';
  } catch {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    // Check Mapbox (lightweight check)
    if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      health.services.mapbox = 'healthy';
    }
  } catch {
    health.services.mapbox = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
```

## Environment Variables

```bash
# .env.example

# Database (PostGIS for geospatial)
DATABASE_URL="postgresql://user:password@localhost:5432/realestate"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

# Mapbox (for maps and geocoding)
NEXT_PUBLIC_MAPBOX_TOKEN="pk.your-mapbox-public-token"
MAPBOX_SECRET_TOKEN="sk.your-mapbox-secret-token"

# File uploads (UploadThing)
UPLOADTHING_SECRET="sk_live_your-uploadthing-secret"
UPLOADTHING_APP_ID="your-app-id"

# Email (for inquiry notifications)
RESEND_API_KEY="re_your-resend-api-key"

# Redis (for rate limiting)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn@sentry.io/project"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="RealEstateApp"

# SEO
NEXT_PUBLIC_SITE_NAME="Your Real Estate Company"
```

## Deployment Checklist

- [ ] **Environment Setup**
  - [ ] All environment variables configured in production
  - [ ] Database connection string uses connection pooling
  - [ ] Mapbox token restricted to production domain
  - [ ] File upload size limits configured

- [ ] **Database**
  - [ ] Run `prisma migrate deploy` on production
  - [ ] PostGIS extension enabled for geospatial queries
  - [ ] Geospatial indexes created (latitude, longitude)
  - [ ] Database backups configured

- [ ] **Security**
  - [ ] NEXTAUTH_SECRET is unique and secure (32+ chars)
  - [ ] Rate limiting enabled for search and inquiry endpoints
  - [ ] CORS configured for production domain only
  - [ ] CSP headers configured
  - [ ] Mapbox token has domain restrictions

- [ ] **Performance**
  - [ ] Property images optimized and served via CDN
  - [ ] Search results paginated and cached
  - [ ] Map tiles cached appropriately
  - [ ] Static pages pre-rendered for SEO

- [ ] **SEO**
  - [ ] JSON-LD structured data for properties
  - [ ] Open Graph meta tags configured
  - [ ] Sitemap generated for properties
  - [ ] Canonical URLs set

- [ ] **Monitoring**
  - [ ] Sentry error tracking configured
  - [ ] Health check endpoint accessible
  - [ ] Search performance metrics tracked
  - [ ] Log aggregation set up

- [ ] **Testing**
  - [ ] All tests passing in CI
  - [ ] E2E tests for search and inquiry flows
  - [ ] Map interactions tested
  - [ ] Mobile responsiveness verified

## Related Skills

- [[maps]] - Mapbox integration
- [[geospatial]] - Location-based search
- [[advanced-search]] - Filter functionality
- [[image-gallery]] - Property galleries
- [[seo]] - Structured data & meta tags
- [[file-upload]] - Image uploads

## Changelog

- 1.0.0: Initial property listing recipe with map search and filters
