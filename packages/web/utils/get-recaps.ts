

// export const getEvents = async (): Promise<Event[]> => {
//     const { documents } = await appwriteDatabase.listDocuments(
//         process.env.APPWRITE_DATABASE_ID || '',
//         process.env.APPWRITE_EVENTS_COLLECTION_ID || ''
//     );
//     const events = documents as unknown as Event[];
//     return events;
// };

// export const getEventById = async (id: string): Promise<Event> => {
//     const event = (await appwriteDatabase.getDocument(
//         process.env.APPWRITE_DATABASE_ID || '',
//         process.env.APPWRITE_EVENTS_COLLECTION_ID || '',
//         id
//     )) as unknown as Event;
//     if (!event) {
//         throw new Error('Event not found');
//     }
//     return event;
// };

export interface Recap {
    $id?: string;
    name: string;
    description: string;
    date: Date;
}

const recaps: Recap[] = [
    {
        $id: '1',
        name: 'Recap 1',
        description: 'This is recap 1',
        date: new Date('2021-01-01'),
    },
    {
        $id: '2',
        name: 'Recap 2',
        description: 'This is recap 2',
        date: new Date('2021-01-02'),
    },
];

export const getRecaps = () => recaps

// export const getRecapById = async (date: string): Promise<Recap> => {
    
//     )) as unknown as Recap;
//     if (!recap) {
//       throw new Error('Recap not found');
//     }
//     return recap;
//   };