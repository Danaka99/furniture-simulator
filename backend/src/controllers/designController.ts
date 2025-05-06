import { Request, Response } from 'express';
import Design, { IDesign } from '../models/design.model';
import { IUser } from '../types/User';
import { Types } from 'mongoose';

interface AuthRequest extends Request {
    user?: IUser & { _id: Types.ObjectId };
}

// Get all designs for a user
export const getDesigns = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const designs = await Design.find({ userId: req.user?._id })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Design.countDocuments({ userId: req.user?._id });

        res.json({
            designs,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            statusCode: 500
        });
    }
};

// Get a single design
export const getDesign = async (req: AuthRequest, res: Response) => {
    try {
        const design = await Design.findOne({
            _id: req.params.id,
            userId: req.user?._id
        });

        if (!design) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Design not found',
                statusCode: 404
            });
        }

        res.json({ design });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            statusCode: 500
        });
    }
};

// Create a new design
export const createDesign = async (req: AuthRequest, res: Response) => {
    try {
        const designData = {
            ...req.body,
            userId: req.user?._id
        };

        const design = new Design(designData);
        await design.save();

        res.status(201).json({
            design,
            message: 'Design created successfully'
        });
    } catch (error) {
        if (error instanceof Error && error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation Error',
                message: error.message,
                statusCode: 400
            });
        }

        res.status(500).json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            statusCode: 500
        });
    }
};

// Update a design
export const updateDesign = async (req: AuthRequest, res: Response) => {
    try {
        const design = await Design.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user?._id
            },
            req.body,
            { new: true, runValidators: true }
        );

        if (!design) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Design not found',
                statusCode: 404
            });
        }

        res.json({
            design,
            message: 'Design updated successfully'
        });
    } catch (error) {
        if (error instanceof Error && error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation Error',
                message: error.message,
                statusCode: 400
            });
        }

        res.status(500).json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            statusCode: 500
        });
    }
};

// Delete a design
export const deleteDesign = async (req: AuthRequest, res: Response) => {
    try {
        const design = await Design.findOneAndDelete({
            _id: req.params.id,
            userId: req.user?._id
        });

        if (!design) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Design not found',
                statusCode: 404
            });
        }

        res.json({
            message: 'Design deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            statusCode: 500
        });
    }
}; 