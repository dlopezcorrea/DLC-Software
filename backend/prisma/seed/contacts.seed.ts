import { PrismaClient } from '@prisma/client';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education'];

export async function seedContacts(prisma: PrismaClient, orgId: string) {
  // Create 10 accounts
  const accountData = [
    { name: 'TechVision Inc', industry: 'Technology', website: 'https://techvision.example.com', employeeCount: 250, annualRevenue: 15000000 },
    { name: 'FinCore Solutions', industry: 'Finance', website: 'https://fincore.example.com', employeeCount: 120, annualRevenue: 8000000 },
    { name: 'MediCare Group', industry: 'Healthcare', website: 'https://medicare-grp.example.com', employeeCount: 500, annualRevenue: 25000000 },
    { name: 'RetailMax LLC', industry: 'Retail', website: 'https://retailmax.example.com', employeeCount: 80, annualRevenue: 4000000 },
    { name: 'BuildCraft Corp', industry: 'Manufacturing', website: 'https://buildcraft.example.com', employeeCount: 350, annualRevenue: 20000000 },
    { name: 'EduLearn Academy', industry: 'Education', website: 'https://edulearn.example.com', employeeCount: 60, annualRevenue: 2000000 },
    { name: 'DataStream Analytics', industry: 'Technology', website: 'https://datastream.example.com', employeeCount: 45, annualRevenue: 3500000 },
    { name: 'CloudBase Systems', industry: 'Technology', website: 'https://cloudbase.example.com', employeeCount: 180, annualRevenue: 12000000 },
    { name: 'GreenPath Energy', industry: 'Manufacturing', website: 'https://greenpath.example.com', employeeCount: 95, annualRevenue: 6000000 },
    { name: 'LogiFlow Transport', industry: 'Retail', website: 'https://logiflow.example.com', employeeCount: 220, annualRevenue: 9000000 },
  ];

  const accounts = [];
  for (const data of accountData) {
    const account = await prisma.account.create({
      data: { ...data, organizationId: orgId, phone: '+1-555-' + Math.floor(1000000 + Math.random() * 9000000), email: `info@${data.name.toLowerCase().replace(/\s+/g, '')}.example.com` },
    });
    accounts.push(account);
  }

  // Create 50 contacts (mix of B2B and B2C)
  const contactData = [
    { firstName: 'James', lastName: 'Wilson', email: 'james.wilson@techvision.example.com', jobTitle: 'CTO', type: 'BUSINESS' as const, accountIdx: 0 },
    { firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@techvision.example.com', jobTitle: 'VP Engineering', type: 'BUSINESS' as const, accountIdx: 0 },
    { firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@fincore.example.com', jobTitle: 'CFO', type: 'BUSINESS' as const, accountIdx: 1 },
    { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@fincore.example.com', jobTitle: 'Finance Director', type: 'BUSINESS' as const, accountIdx: 1 },
    { firstName: 'Robert', lastName: 'Johnson', email: 'robert.j@medicare-grp.example.com', jobTitle: 'CEO', type: 'BUSINESS' as const, accountIdx: 2 },
    { firstName: 'Jennifer', lastName: 'Martinez', email: 'jennifer.m@retailmax.example.com', jobTitle: 'Procurement Manager', type: 'BUSINESS' as const, accountIdx: 3 },
    { firstName: 'David', lastName: 'Garcia', email: 'david.garcia@buildcraft.example.com', jobTitle: 'Operations Director', type: 'BUSINESS' as const, accountIdx: 4 },
    { firstName: 'Lisa', lastName: 'Thompson', email: 'lisa.t@edulearn.example.com', jobTitle: 'Dean', type: 'BUSINESS' as const, accountIdx: 5 },
    { firstName: 'Kevin', lastName: 'Anderson', email: 'kevin.a@datastream.example.com', jobTitle: 'CEO', type: 'BUSINESS' as const, accountIdx: 6 },
    { firstName: 'Amy', lastName: 'Taylor', email: 'amy.taylor@cloudbase.example.com', jobTitle: 'CTO', type: 'BUSINESS' as const, accountIdx: 7 },
    // B2C contacts
    { firstName: 'Tom', lastName: 'Baker', email: 'tom.baker@gmail.com', jobTitle: undefined, type: 'INDIVIDUAL' as const, accountIdx: null },
    { firstName: 'Alice', lastName: 'Cooper', email: 'alice.cooper@yahoo.com', jobTitle: undefined, type: 'INDIVIDUAL' as const, accountIdx: null },
    { firstName: 'Frank', lastName: 'Miller', email: 'frank.miller@outlook.com', jobTitle: undefined, type: 'INDIVIDUAL' as const, accountIdx: null },
    { firstName: 'Grace', lastName: 'Lee', email: 'grace.lee@hotmail.com', jobTitle: undefined, type: 'INDIVIDUAL' as const, accountIdx: null },
    { firstName: 'Henry', lastName: 'White', email: 'henry.white@gmail.com', jobTitle: undefined, type: 'INDIVIDUAL' as const, accountIdx: null },
  ];

  const contacts = [];
  for (const { accountIdx, ...data } of contactData) {
    const contact = await prisma.contact.create({
      data: {
        ...data,
        organizationId: orgId,
        phone: '+1-555-' + Math.floor(1000000 + Math.random() * 9000000),
        accountId: accountIdx !== null ? accounts[accountIdx].id : undefined,
        source: 'REFERRAL',
        emailOptIn: true,
      },
    });
    contacts.push(contact);
  }

  return { contacts, accounts };
}
