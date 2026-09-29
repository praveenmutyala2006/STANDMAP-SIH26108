"""
STANDMAP - Sample Procurement Tenders for Demonstration & Verification
Pre-loaded authentic tender specifications covering clean, ambiguous, outdated, and gap-heavy procurement documents.
"""

SAMPLE_TENDERS = [
    {
        "id": "DEMO-TENDER-01",
        "title": "Procurement of 5.0 HP 3-Phase Monoset Water Pump Sets for Agricultural Water Supply",
        "organization": "Department of Rural Water Supply & Sanitation, Govt. of Maharashtra",
        "category": "PUMPS_AND_MOTORS",
        "document_type": "Tender Technical Specification (Section IV)",
        "file_name": "Tender_MH_MonosetPump_5HP_2026.pdf",
        "full_text": """TENDER SPECIFICATION NO: RWS/2026/PUMP-5HP/04
SECTION 4: TECHNICAL SPECIFICATIONS FOR AGRICULTURAL MONOSET PUMPS

4.1 SCOPE OF WORK & PRODUCT DEFINITION:
Supply, testing, and delivery of 5.0 HP (3.7 kW) Three-Phase Electric Monoset Centrifugal Water Pump Sets directly coupled to prime mover, suitable for lifting clear cold water for agricultural irrigation and rural water supply schemes.

4.2 OPERATING CONDITIONS & PERFORMANCE:
The pump set shall operate continuously at rated speed 2880 RPM under the following duty point conditions:
- Rated Discharge: Minimum 250 Litres Per Minute (LPM) at a total operating Head of 45 Metres.
- Liquid Handled: Clean cold drinking water (temperature up to 45 deg C, turbidity < 50 NTU).
- Hydraulic Efficiency: Overall pump efficiency shall not be less than 55% at duty point conforming to standard pump test codes.

4.3 ELECTRICAL SPECIFICATIONS & MOTOR EFFICIENCY:
- Power Supply: 415 Volts (+/- 10%), 3-Phase, 50 Hz (+/- 3%) AC line supply.
- Motor Rating: 5.0 HP (3.7 kW) line operated three-phase induction motor.
- Insulation: Class F insulation with Class B temperature rise limit.
- Energy Efficiency: The electric motor must conform strictly to minimum IE3 premium energy efficiency class.

4.4 ENCLOSURE & ENVIRONMENTAL PROTECTION:
- Degree of Protection: Motor enclosure must provide minimum IP55 protection.
- Installation: Suitable for outdoor unshaded installation in harsh tropical environment up to 50 deg C ambient temperature.

4.5 MANDATORY TESTING & FACTORY ACCEPTANCE:
- Hydrostatic pressure testing of pump casing at 1.5 times the maximum shut-off head for a minimum duration of 5 minutes.
- Factory routine performance tests for discharge, head, and power consumption according to standardized pump test codes.

4.6 REGULATORY COMPLIANCE & CERTIFICATION:
- The supplied monoset pump set must hold a valid Bureau of Indian Standards (BIS) license carrying the Standard ISI Mark under the Pumps (Quality Control) Order, 2023.
- Electrical earthing terminal must be provided on motor frame in compliance with standard earthing codes.
"""
    },
    {
        "id": "DEMO-TENDER-02",
        "title": "Supply of 1.1 kV Underground Power Distribution Cables (Material Ambiguity Demo)",
        "organization": "State Electricity Distribution Corporation (DISCOM)",
        "category": "ELECTRICAL_CABLES",
        "document_type": "Tender Technical Specification",
        "file_name": "DISCOM_UG_Power_Cables_Spec.pdf",
        "full_text": """TENDER DOCUMENT: DISCOM/TENDER/2026/CAB-09
SECTION 3: DETAILED TECHNICAL SPECIFICATIONS FOR POWER CABLES

3.1 PRODUCT SPECIFICATION (UNSPECIFIED INSULATION POLYMER):
Supply of 3.5 Core 240 sq.mm and 4 Core 185 sq.mm Heavy Duty Armoured Aluminium Conductor Power Distribution Cables for working voltages up to and including 1100 V (1.1 kV).
[AMBIGUITY NOTICE: Clause specifies 1.1 kV voltage and steel armouring, but does not specify whether cable insulation is PVC (IS 694) or XLPE (IS 7098 Part 1), creating a multi-candidate conflict].

3.2 CONDUCTOR & SHEATH REQUIREMENTS:
- Conductor: Stranded compact circular aluminium conductor (Class 2) complying with standard conductor resistance requirements.
- Armouring: Galvanized steel strip armour providing minimum 90% surface coverage for mechanical protection against direct underground burial.
- Voltage Rating: Suitable for continuous 1100 V AC distribution.

3.3 TESTING AND CERTIFICATION:
- Cables must undergo high voltage AC spark testing and conductor resistance routine tests.
- Outer sheath shall be embossed at every meter with Manufacturer Name, Year of Manufacture, Voltage Grade 1100V, and Mandatory BIS ISI Standard Mark.
"""
    },
    {
        "id": "DEMO-TENDER-03",
        "title": "Procurement of 250 kVA 11kV/433V Oil Immersed Distribution Transformers (Legacy Spec)",
        "organization": "Urban Infrastructure Development Authority",
        "category": "TRANSFORMERS",
        "document_type": "Procurement Specification (Legacy Tender)",
        "file_name": "UIDA_Transformer_Procurement_Legacy.docx",
        "full_text": """SPECIFICATION REF: UIDA/ELEC/DT-250/2012
TECHNICAL PARTICULARS FOR 250 kVA DISTRIBUTION TRANSFORMERS

1. SCOPE:
Design, engineering, manufacture, and testing of outdoor type oil-immersed naturally cooled 250 kVA, 11 kV / 433 V, 3-Phase, 50 Hz step down distribution transformers.

2. STANDARDS APPLICABLE (LEGACY CLAUSE):
The transformers shall comply with Indian Standard IS 1180:1989 and IS 2026:2011 for performance and testing.
[NOTE: This specification contains an outdated 1989 reference that should trigger a version update alert].

3. TRANSFORMER OIL:
The transformer tank shall be filled with new uninhibited mineral insulating oil having minimum dielectric breakdown voltage of 60 kV after filtration and moisture content less than 20 ppm.

4. LOSSES & EFFICIENCY:
The maximum total losses at 50% and 100% loading shall not exceed BEE Star 2 standards at 75 deg C.
"""
    },
    {
        "id": "DEMO-TENDER-04",
        "title": "Solar Photovoltaic Water Pumping System with Cloud IoT Telemetry Controller",
        "organization": "Renewable Energy Development Agency",
        "category": "SOLAR_SYSTEMS",
        "document_type": "Tender Document",
        "file_name": "REDA_Solar_Water_Pumping_IoT_Spec.pdf",
        "full_text": """TENDER NOTICE: REDA/SPV/2026/PUMP-08
TECHNICAL SPECIFICATIONS FOR SOLAR PV WATER PUMPING SYSTEM

1. SOLAR PHOTOVOLTAIC MODULE ARRAY:
- Total PV Array Capacity: 5000 Wp consisting of Mono-crystalline PERC solar modules of minimum 540 Wp rating each.
- Module Quality: Terrestrial crystalline silicon PV modules with ALMM approval and certified under MNRE Compulsory Registration Scheme (CRS).

2. SOLAR PUMP CONTROLLER / INVERTER (VFD):
- Microprocessor-based Variable Frequency Drive (VFD) with Maximum Power Point Tracking (MPPT) efficiency > 98%.
- Inverter safety conforming to standard power converter safety requirements for solar PV systems.

3. CUSTOM CLOUD IOT TELEMETRY (POTENTIAL SPECIFICATION GAP):
- The controller must integrate an embedded 4G/5G SIM telemetry module transmitting live water flow rate and solar irradiance to an unstandardized custom proprietary vendor cloud API every 10 seconds.
[NOTE: This custom telemetry protocol has no standard BIS testing specification, demonstrating the platform's ability to flag unstandardized procurement gaps].
"""
    }
]
