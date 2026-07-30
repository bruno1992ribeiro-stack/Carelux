const filter = await getResidentFilter();

const residents = await prisma.resident.findMany({
    where: filter
});