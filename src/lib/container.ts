// Dependency Injection Container
// Creates and manages singleton instances of repositories and controllers

import { supabase } from './supabase';

// Repository imports
import {
    SupabaseOrganizerRepository,
    SupabaseEventRepository,
    SupabaseGuestRepository,
    SupabaseGateRepository,
    SupabaseScanRepository,
} from '../infrastructure/repositories';
import { SupabaseGateSessionRepository } from '../infrastructure/repositories/SupabaseGateSessionRepository';

// Controller imports
import {
    OrganizerController,
    EventController,
    GuestController,
    GateController,
    ScanController,
} from '../adapters/controllers';

// Repository instances
export const organizerRepository = new SupabaseOrganizerRepository(supabase);
export const eventRepository = new SupabaseEventRepository(supabase);
export const guestRepository = new SupabaseGuestRepository(supabase);
export const gateRepository = new SupabaseGateRepository(supabase);
export const scanRepository = new SupabaseScanRepository(supabase);
export const gateSessionRepository = new SupabaseGateSessionRepository(supabase);

// Controller instances with injected dependencies
export const organizerController = new OrganizerController(organizerRepository);

export const eventController = new EventController(
    eventRepository,
    organizerRepository
);

export const guestController = new GuestController(
    guestRepository,
    eventRepository
);

export const gateController = new GateController(
    gateRepository,
    eventRepository,
    gateSessionRepository
);

export const scanController = new ScanController(
    scanRepository,
    guestRepository,
    gateRepository,
    eventRepository
);
