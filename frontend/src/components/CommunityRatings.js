import React, { useState } from 'react';
import { ArrowLeft, Star, MessageSquare, ThumbsUp, Send, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { useBusiness } from '../contexts/BusinessContext';
import { useRole } from '../contexts/RoleContext';

export default function CommunityRatings() {
  const navigate = useNavigate();
  const { getData, setData, activeBusiness } = useBusiness();
  const { hasPermission } = useRole();
  
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // Get ratings data
  const ratings = getData('ratings', []);
  const reviews = getData('reviews', []);

  // Calculate rating statistics
  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1) : 0;
  
  const ratingBreakdown = {
    5: ratings.filter(r => r.rating === 5).length,
    4: ratings.filter(r => r.rating === 4).length,
    3: ratings.filter(r => r.rating === 3).length,
    2: ratings.filter(r => r.rating === 2).length,
    1: ratings.filter(r => r.rating === 1).length
  };

  // Sample reviews (if no reviews in storage)
  const sampleReviews = reviews.length > 0 ? reviews : [
    { id: 1, customer: 'Rajesh Kumar', rating: 5, comment: 'Excellent service! Very professional and prompt delivery.', date: '2025-01-08', responded: false },
    { id: 2, customer: 'Priya Sharma', rating: 4, comment: 'Good quality products. Prices are reasonable.', date: '2025-01-07', responded: true },
    { id: 3, customer: 'Amit Patel', rating: 5, comment: 'Best petrol pump in the area. Staff is very helpful.', date: '2025-01-06', responded: false },
    { id: 4, customer: 'Sneha Reddy', rating: 3, comment: 'Average experience. Could improve cleanliness.', date: '2025-01-05', responded: false },
  ];

  const handleResponse = (review) => {
    setSelectedReview(review);
    setShowResponseDialog(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Community Ratings</h1>
              <p className="text-xs text-slate-400">{activeBusiness.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Overall Rating Card */}
        <Card className="bg-gradient-to-br from-yellow-600 to-orange-600 border-0 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-100 mb-1">Overall Rating</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">{averageRating}</span>
                  <span className="text-lg text-yellow-100">/5.0</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-white text-white' : 'text-yellow-200'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-yellow-100 mt-2">{totalRatings} total ratings</p>
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                <TrendingUp className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">+12%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Breakdown */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-4">
            <h2 className="text-base font-bold text-yellow-400 mb-3">Rating Breakdown</h2>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm text-slate-400">{star}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${totalRatings > 0 ? (ratingBreakdown[star] / totalRatings * 100) : 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-400 w-12 text-right">
                    {ratingBreakdown[star] || 0}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-blue-400">Recent Reviews</h2>
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>

            <div className="space-y-3">
              {sampleReviews.map(review => (
                <div key={review.id} className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-white">{review.customer}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'}`}
                          />
                        ))}
                        <span className="text-xs text-slate-400 ml-1">{review.date}</span>
                      </div>
                    </div>
                    {review.responded && (
                      <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">Responded</span>
                    )}
                  </div>

                  <p className="text-sm text-slate-300 mb-2">{review.comment}</p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResponse(review)}
                      className="text-blue-400 hover:bg-blue-900/30 h-7 text-xs"
                      disabled={review.responded}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      {review.responded ? 'Responded' : 'Respond'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:bg-slate-600 h-7 text-xs"
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Helpful
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
            <p className="text-xs text-slate-400">Response Rate</p>
            <p className="text-sm font-bold text-green-400">
              {sampleReviews.length > 0 ? ((sampleReviews.filter(r => r.responded).length / sampleReviews.length) * 100).toFixed(0) : 0}%
            </p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
            <p className="text-xs text-slate-400">This Week</p>
            <p className="text-sm font-bold text-blue-400">+{sampleReviews.length}</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
            <p className="text-xs text-slate-400">Avg Response</p>
            <p className="text-sm font-bold text-purple-400">2.5h</p>
          </div>
        </div>

        {/* Customer Feedback Categories */}
        <Card className="bg-slate-800 border-slate-700 mt-4">
          <CardContent className="p-4">
            <h2 className="text-base font-bold text-green-400 mb-3">Feedback Categories</h2>
            <div className="space-y-2">
              {[
                { category: 'Service Quality', positive: 85, negative: 15, icon: '👍' },
                { category: 'Product Quality', positive: 90, negative: 10, icon: '⭐' },
                { category: 'Pricing', positive: 78, negative: 22, icon: '💰' },
                { category: 'Cleanliness', positive: 72, negative: 28, icon: '✨' },
                { category: 'Staff Behavior', positive: 88, negative: 12, icon: '😊' }
              ].map(item => (
                <div key={item.category} className="p-2 bg-slate-700/30 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-white">{item.icon} {item.category}</span>
                    <span className="text-xs text-green-400">{item.positive}% positive</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 bg-slate-600 rounded-full h-1.5">
                      <div 
                        className="bg-green-400 h-1.5 rounded-full"
                        style={{ width: `${item.positive}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rating Trends */}
        <Card className="bg-slate-800 border-slate-700 mt-4">
          <CardContent className="p-4">
            <h2 className="text-base font-bold text-purple-400 mb-3">Rating Trends</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                <p className="text-xs text-blue-100">This Month</p>
                <p className="text-xl font-bold text-white">4.6</p>
                <p className="text-xs text-green-300">↑ 0.3 from last month</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg">
                <p className="text-xs text-purple-100">Last Month</p>
                <p className="text-xl font-bold text-white">4.3</p>
                <p className="text-xs text-purple-200">Previous period</p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-slate-700/50 rounded">
              <p className="text-xs text-slate-400 mb-2">Monthly Progress</p>
              <div className="flex justify-between items-end h-20 gap-1">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => {
                  const heights = [40, 55, 48, 65, 70, 85];
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t"
                        style={{ height: `${heights[idx]}%` }}
                      />
                      <span className="text-xs text-slate-400">{month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Sentiment */}
        <Card className="bg-slate-800 border-slate-700 mt-4">
          <CardContent className="p-4">
            <h2 className="text-base font-bold text-orange-400 mb-3">Customer Sentiment</h2>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-green-900/30 border border-green-700 rounded-lg text-center">
                <p className="text-2xl mb-1">😊</p>
                <p className="text-xs text-slate-400">Positive</p>
                <p className="text-sm font-bold text-green-400">78%</p>
              </div>
              <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg text-center">
                <p className="text-2xl mb-1">😐</p>
                <p className="text-xs text-slate-400">Neutral</p>
                <p className="text-sm font-bold text-yellow-400">15%</p>
              </div>
              <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-center">
                <p className="text-2xl mb-1">😞</p>
                <p className="text-xs text-slate-400">Negative</p>
                <p className="text-sm font-bold text-red-400">7%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Dialog */}
      {showResponseDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
            <CardContent className="p-4">
              <h3 className="text-lg font-bold text-white mb-3">Respond to Review</h3>
              <p className="text-sm text-slate-300 mb-4">"{selectedReview?.comment}"</p>
              <Input
                placeholder="Type your response..."
                className="bg-slate-700 border-slate-600 text-white mb-3"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowResponseDialog(false)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Send Response
                </Button>
                <Button
                  onClick={() => setShowResponseDialog(false)}
                  variant="outline"
                  className="border-slate-600"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
