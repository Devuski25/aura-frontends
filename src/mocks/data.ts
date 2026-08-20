/**
 * Mock data layer for the standalone UI sandbox.
 *
 * This is a faithful replica of the data shapes served by the AURA-Dx
 * backend (FastAPI) and Supabase views. No live backend is contacted —
 * every screen renders from these static (but mutable) records so the
 * UI can be exercised end-to-end.
 */

export type Role = "clinician" | "admin" | "super_admin"
export type AccountStatus = "pending" | "approved" | "rejected" | "deleted"

export interface MockUser {
  id: string
  email: string
  full_name: string
  role: Role
  status: AccountStatus
  clinic_id: string | null
  phone: string | null
  specialization: string | null
  license_number: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
  avatar_url: string | null
  user_metadata?: { full_name?: string }
}

export interface MockPatient {
  id: string
  full_name: string
  date_of_birth: string
  gender: "male" | "female" | "other"
  smoking_history: boolean
  pack_years: number | null
  past_respiratory_diseases: string[]
  symptoms: string[]
  clinic_id: string
  clinician_id: string
  clinician_name: string
  clinic_name: string
  age_bracket: string
  created_at: string
}

export interface MockScreening {
  id: string
  patient_id: string
  patient_name: string
  date_of_birth: string
  patient_dob: string
  gender: string
  patient_gender: string
  age_bracket: string
  clinic_id: string
  clinic_name: string
  clinician_id: string
  clinician_name: string
  audio_file_path: string | null
  audio_duration_sec: number | null
  tb_result: string
  tb_confidence: number | null
  tb_probabilities: Record<string, number> | null
  respiratory_result: string | null
  respiratory_confidence: number | null
  respiratory_probabilities: Record<string, number> | null
  cascade_path: string
  model_version: string
  status: string
  reviewed_by: string | null
  reviewed_by_name: string | null
  reviewed_at: string | null
  review_notes: string | null
  created_at: string
  updated_at: string
}

const ISO = (daysAgo = 0, hoursAgo = 0) =>
  new Date(Date.now() - daysAgo * 86400000 - hoursAgo * 3600000).toISOString()

export const MOCK_CLINIC = {
  id: "clinic-001",
  name: "URS Morong Health Center",
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "user-superadmin",
    email: "rheincama@gmail.com",
    full_name: "Rein Cama",
    role: "super_admin",
    status: "approved",
    clinic_id: null,
    phone: null,
    specialization: "System Administrator",
    license_number: null,
    last_login_at: ISO(0, 1),
    created_at: ISO(90),
    updated_at: ISO(0, 1),
    avatar_url: null,
  },
  {
    id: "user-admin",
    email: "maria.santos@urs.edu.ph",
    full_name: "Maria Santos",
    role: "admin",
    status: "approved",
    clinic_id: "clinic-001",
    phone: "+63 917 000 1122",
    specialization: "Internal Medicine",
    license_number: "PRC-112345",
    last_login_at: ISO(0, 3),
    created_at: ISO(60),
    updated_at: ISO(0, 3),
    avatar_url: null,
  },
  {
    id: "user-clinician",
    email: "dr.john.smith@clinic.com",
    full_name: "Dr. John Smith",
    role: "clinician",
    status: "approved",
    clinic_id: "clinic-001",
    phone: "+63 918 000 3344",
    specialization: "Pulmonology",
    license_number: "PRC-998877",
    last_login_at: ISO(0, 5),
    created_at: ISO(30),
    updated_at: ISO(0, 5),
    avatar_url: null,
  },
  {
    id: "user-clinician2",
    email: "jose.reyes@clinic.com",
    full_name: "Jose Reyes, RN",
    role: "clinician",
    status: "approved",
    clinic_id: "clinic-001",
    phone: "+63 919 000 5566",
    specialization: "General Practice",
    license_number: "PRC-554433",
    last_login_at: ISO(1),
    created_at: ISO(25),
    updated_at: ISO(1),
    avatar_url: null,
  },
  {
    id: "user-pending",
    email: "pending@clinic.com",
    full_name: "Anna Cruz",
    role: "clinician",
    status: "pending",
    clinic_id: null,
    phone: null,
    specialization: null,
    license_number: null,
    last_login_at: null,
    created_at: ISO(2),
    updated_at: ISO(2),
    avatar_url: null,
  },
  {
    id: "user-rejected",
    email: "rejected@clinic.com",
    full_name: "Ben Torres",
    role: "clinician",
    status: "rejected",
    clinic_id: null,
    phone: null,
    specialization: null,
    license_number: null,
    last_login_at: null,
    created_at: ISO(4),
    updated_at: ISO(3),
    avatar_url: null,
  },
]

const patient = (
  id: string,
  full_name: string,
  date_of_birth: string,
  gender: "male" | "female" | "other",
  smoking: boolean,
  pack_years: number | null,
  past: string[],
  symptoms: string[],
  clinician_id: string,
  clinician_name: string,
  daysAgo: number,
): MockPatient => {
  const birth = new Date(date_of_birth)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  const bracket = age < 18 ? "pediatric" : age < 65 ? "adult" : "geriatric"
  return {
    id,
    full_name,
    date_of_birth,
    gender,
    smoking_history: smoking,
    pack_years,
    past_respiratory_diseases: past,
    symptoms,
    clinic_id: MOCK_CLINIC.id,
    clinician_id,
    clinician_name,
    clinic_name: MOCK_CLINIC.name,
    age_bracket: bracket,
    created_at: ISO(daysAgo),
  }
}

export const MOCK_PATIENTS: MockPatient[] = [
  patient("pt-001", "Ramon Villanueva", "1958-03-12", "male", true, 42, ["COPD"], ["Cough", "Shortness of breath", "Chest pain"], "user-clinician", "Dr. John Smith", 21),
  patient("pt-002", "Luzviminda Dela Cruz", "1992-07-05", "female", false, null, ["Asthma"], ["Cough", "Wheezing"], "user-clinician", "Dr. John Smith", 19),
  patient("pt-003", "Carlos Mendoza", "1985-11-23", "male", true, 15, ["Bronchitis"], ["Cough", "Fever", "Weight loss"], "user-clinician", "Dr. John Smith", 16),
  patient("pt-004", "Elena Fernandez", "2001-01-30", "female", false, null, [], ["Cough", "Sore throat"], "user-clinician", "Dr. John Smith", 12),
  patient("pt-005", "Miguel Ocampo", "1949-09-17", "male", true, 58, ["Pneumonia"], ["Cough", "Fever", "Hemoptysis (coughing blood)"], "user-clinician2", "Jose Reyes, RN", 9),
  patient("pt-006", "Sofia Ramirez", "1977-05-22", "female", false, null, [], ["Cough", "Runny nose"], "user-clinician2", "Jose Reyes, RN", 7),
  patient("pt-007", "Andres Bautista", "1963-02-14", "male", true, 33, ["COPD", "Sleep Apnea"], ["Shortness of breath", "Cough"], "user-clinician", "Dr. John Smith", 5),
  patient("pt-008", "Diana Navarro", "1995-12-08", "female", false, null, ["Asthma"], ["Cough", "Wheezing", "Chest pain"], "user-clinician2", "Jose Reyes, RN", 2),
]

const screening = (
  id: string,
  patientRec: MockPatient,
  tb: "TB" | "Non-TB",
  tbConf: number,
  resp: "Healthy" | "COPD" | "Pneumonia" | null,
  respConf: number | null,
  status: string,
  reviewed_by_name: string | null,
  daysAgo: number,
  hoursAgo = 0,
): MockScreening => {
  const tbProbs = tb === "TB"
    ? { TB: tbConf, "Non-TB": Number((1 - tbConf).toFixed(4)) }
    : { TB: Number((1 - tbConf).toFixed(4)), "Non-TB": tbConf }
  const respProbs = resp
    ? {
        Healthy: resp === "Healthy" ? respConf! : Number(((1 - respConf!) / 2).toFixed(4)),
        COPD: resp === "COPD" ? respConf! : resp === "Healthy" ? Number(((1 - respConf!) / 2).toFixed(4)) : Number(((1 - respConf!) / 2).toFixed(4)),
        Pneumonia: resp === "Pneumonia" ? respConf! : Number(((1 - respConf!) / 2).toFixed(4)),
      }
    : null
  return {
    id,
    patient_id: patientRec.id,
    patient_name: patientRec.full_name,
    date_of_birth: patientRec.date_of_birth,
    patient_dob: patientRec.date_of_birth,
    gender: patientRec.gender,
    patient_gender: patientRec.gender,
    age_bracket: patientRec.age_bracket,
    clinic_id: patientRec.clinic_id,
    clinic_name: patientRec.clinic_name,
    clinician_id: patientRec.clinician_id,
    clinician_name: patientRec.clinician_name,
    audio_file_path: `uploads/audio/${id}.wav`,
    audio_duration_sec: Math.round((3 + (daysAgo % 5)) * 100) / 100,
    tb_result: tb,
    tb_confidence: tbConf,
    tb_probabilities: tbProbs,
    respiratory_result: resp,
    respiratory_confidence: respConf,
    respiratory_probabilities: respProbs,
    cascade_path: resp ? "Tier 1 → Tier 2" : "Tier 1 (stopped)",
    model_version: "resnet18_v2.4.1",
    status,
    reviewed_by: reviewed_by_name ? "user-admin" : null,
    reviewed_by_name,
    reviewed_at: reviewed_by_name ? ISO(Math.max(0, daysAgo - 1)) : null,
    review_notes: reviewed_by_name ? "Findings consistent with clinical presentation. Follow-up advised." : null,
    created_at: ISO(daysAgo, hoursAgo),
    updated_at: ISO(daysAgo),
  }
}

export const MOCK_SCREENINGS: MockScreening[] = [
  screening("scr-001", MOCK_PATIENTS[0], "Non-TB", 0.94, "COPD", 0.87, "completed", "Maria Santos", 21),
  screening("scr-002", MOCK_PATIENTS[1], "Non-TB", 0.91, "Healthy", 0.96, "completed", "Maria Santos", 19),
  screening("scr-003", MOCK_PATIENTS[2], "TB", 0.88, null, null, "completed", null, 16),
  screening("scr-004", MOCK_PATIENTS[3], "Non-TB", 0.97, "Healthy", 0.99, "completed", "Maria Santos", 12),
  screening("scr-005", MOCK_PATIENTS[4], "TB", 0.92, null, null, "pending_review", null, 9),
  screening("scr-006", MOCK_PATIENTS[5], "Non-TB", 0.95, "Healthy", 0.93, "completed", "Maria Santos", 7),
  screening("scr-007", MOCK_PATIENTS[6], "Non-TB", 0.89, "COPD", 0.84, "pending_review", null, 5),
  screening("scr-008", MOCK_PATIENTS[7], "Non-TB", 0.93, "Pneumonia", 0.81, "completed", null, 2),
  screening("scr-009", MOCK_PATIENTS[3], "Non-TB", 0.96, "Healthy", 0.98, "error", null, 0, 6),
]

export const MOCK_METRICS = {
  total_requests: 1284,
}

/** Randomly pick a plausible mock screening result for newly submitted runs. */
export function randomMockResult(): Pick<
  MockScreening,
  | "tb_result"
  | "tb_confidence"
  | "tb_probabilities"
  | "respiratory_result"
  | "respiratory_confidence"
  | "respiratory_probabilities"
  | "cascade_path"
  | "model_version"
> {
  const roll = Math.random()
  if (roll < 0.12) {
    return {
      tb_result: "TB",
      tb_confidence: 0.85 + Math.random() * 0.12,
      tb_probabilities: null,
      respiratory_result: null,
      respiratory_confidence: null,
      respiratory_probabilities: null,
      cascade_path: "Tier 1 (stopped)",
      model_version: "resnet18_v2.4.1",
    }
  }
  const respPool: Array<["Healthy" | "COPD" | "Pneumonia", number]> = [
    ["Healthy", 0.88],
    ["Healthy", 0.95],
    ["COPD", 0.82],
    ["Pneumonia", 0.79],
  ]
  const [resp, conf] = respPool[Math.floor(Math.random() * respPool.length)]
  const tbConf = 0.9 + Math.random() * 0.08
  const tbProbs = { TB: Number((1 - tbConf).toFixed(4)), "Non-TB": tbConf }
  const respProbs = {
    Healthy: resp === "Healthy" ? conf : Number(((1 - conf) / 2).toFixed(4)),
    COPD: resp === "COPD" ? conf : Number(((1 - conf) / 2).toFixed(4)),
    Pneumonia: resp === "Pneumonia" ? conf : Number(((1 - conf) / 2).toFixed(4)),
  }
  return {
    tb_result: "Non-TB",
    tb_confidence: Number(tbConf.toFixed(4)),
    tb_probabilities: tbProbs,
    respiratory_result: resp,
    respiratory_confidence: conf,
    respiratory_probabilities: respProbs,
    cascade_path: "Tier 1 → Tier 2",
    model_version: "resnet18_v2.4.1",
  }
}