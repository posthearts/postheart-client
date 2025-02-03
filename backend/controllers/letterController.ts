import { Request, Response } from 'express';
import Letter from '../models/Letter';
import User from '../models/User';
import generateShareableLink from '../utils/generateShareableLink';
import { AuthenticatedRequest } from '../types';
import PDFDocument from 'pdfkit';


// Create a new letter
export const createLetter = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, title, content, frameColor, paper, fontFamily, contentAlignment, addOns } = req.body;
    const shareableLink = generateShareableLink();
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const letter = new Letter({
      id, // Use the custom ID from the frontend
      user_id: req.user._id,
      title,
      content,
      shareable_link: shareableLink,
      frameColor,
      paper,
      fontFamily,
      contentAlignment, // Include contentAlignment
      addOns
    });
    await letter.save();
    res.status(201).json(letter);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: 'Error creating letter', error: error.message });
  }
};

// Update a letter
export const updateLetter = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content, frameColor, paper, fontFamily, contentAlignment, addOns } = req.body;
    const letter = await Letter.findOneAndUpdate(
      { id: req.params.letter_id }, // Use the custom ID from the frontend
      { content, frameColor, paper, fontFamily, contentAlignment, addOns, updatedAt: Date.now() },
      { new: true }
    );
    res.json({ message: 'Letter updated successfully', letter });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: 'Error updating letter', error: error.message });
  }
};

// Fetch a letter
export const getLetter = async (req: Request, res: Response) => {
  try {
    const letter = await Letter.findOne({ id: req.params.letter_id }); // Use the custom ID from the frontend
    res.json(letter);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: 'Error fetching letter', error: error.message });
  }
};

// Fetch all letters for the user
export const getAllLetters = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const letters = await Letter.find({ user_id: req.user._id }); // Use MongoDB's default _id for users
    res.json(letters);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: 'Error fetching letters', error: error.message });
  }
};

// Delete a letter
export const deleteLetter = async (req: Request, res: Response) => {
  try {
    await Letter.findOneAndDelete({ id: req.params.letter_id }); // Use the custom ID from the frontend
    res.json({ message: 'Letter deleted successfully' });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: 'Error deleting letter', error: error.message });
  }
};

// Fetch a letter by its shareable link
export const getLetterByShareableLink = async (req: Request, res: Response) => {
  try {
    const letter = await Letter.findOne({ shareable_link: req.params.shareable_link }).select('id title content user_id frameColor paper fontFamily contentAlignment addOns');
    if (!letter) {
      return res.status(404).json({ message: 'Letter not found' });
    }

    const user = await User.findById(letter.user_id).select('name profile_picture');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: letter.id,
      title: letter.title,
      content: letter.content,
      frameColor: letter.frameColor,
      paper: letter.paper,
      fontFamily: letter.fontFamily,
      contentAlignment: letter.contentAlignment,
      addOns: letter.addOns,
      name: user.name,
      profile_picture: user.profile_picture
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: 'Error fetching letter', error: error.message });
  }
};

// Generate PDF for a letter
export const generatePDF = async (req: Request, res: Response) => {
  try {
    const letter = await Letter.findOne({ id: req.params.letter_id }).populate('user_id'); // Use the custom ID from the frontend
    if (!letter) {
      return res.status(404).json({ message: 'Letter not found' });
    }

    // Create a new PDF document
    const doc = new PDFDocument();
    // Set up response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${letter.title || 'letter'}.pdf`);

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add letter content to the PDF
    doc.fontSize(25).text(letter.title || 'Untitled', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(letter.content);
    doc.moveDown();

    // Add metadata for style settings as hidden text
    const metadata = {
      frameColor: letter.frameColor,
      paper: letter.paper,
      fontFamily: letter.fontFamily,
      contentAlignment: letter.contentAlignment, // Include contentAlignment
      addOns: letter.addOns
    };
    doc.fontSize(1).fillOpacity(0).text(JSON.stringify(metadata));

    // Finalize the PDF and end the stream
    doc.end();
  } catch (err) {
    const error = err as Error;
    console.error('Error generating PDF:', error.message);
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
};