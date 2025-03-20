const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://trungcr:Bm@PjFRequYd5.r@smartmanager.xrsyb.mongodb.net/smart_manager';

async function updateJobRequestSchema() {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        // Add new fields to existing documents
        await mongoose.connection.db.collection('jobrequests').updateMany(
            { customerEmail: { $exists: false } },
            [
                {
                    $set: {
                        customerEmail: "",
                        customerPhone: ""
                    }
                }
            ]
        );

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

updateJobRequestSchema();